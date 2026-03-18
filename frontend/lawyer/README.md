"""
LawConnect AI Chatbot - Main Implementation
A multilingual legal assistant for Sri Lankan law using RAG architecture
"""

import torch
from transformers import (
    AutoTokenizer, 
    AutoModelForCausalLM, 
    AutoModelForSeq2SeqLM,
    BitsAndBytesConfig,
    pipeline
)
from sentence_transformers import SentenceTransformer
import chromadb
from typing import Dict, List, Tuple

class LawConnectChatbot:
    """
    Main chatbot class that integrates all AI models for the LawConnect application.
    
    Features:
    - Multilingual support (English, Sinhala, Tamil)
    - RAG-based answer generation
    - Legal document search
    - Automatic language detection and translation
    """
    
    def __init__(self, use_gpu: bool = True, use_quantization: bool = True):
        """
        Initialize the LawConnect chatbot with all required models.
        
        Args:
            use_gpu: Whether to use GPU if available
            use_quantization: Whether to use 4-bit quantization for generation model (saves VRAM)
        """
        self.device = "cuda" if use_gpu and torch.cuda.is_available() else "cpu"
        print(f"🔧 Initializing LawConnect Chatbot on device: {self.device}")
        
        # Load all models
        self._load_embedding_model()
        self._load_translation_model()
        self._load_generation_model(use_quantization)
        self._load_language_detector()
        self._initialize_vector_database()
        
        print("✅ All models loaded successfully!")
    
    def _load_embedding_model(self):
        """Load the multilingual embedding model for semantic search"""
        print("📥 Loading embedding model...")
        self.embedder = SentenceTransformer(
            'sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2'
        )
        print("✓ Embedding model loaded")
    
    def _load_translation_model(self):
        """Load NLLB translation model for multilingual support"""
        print("📥 Loading translation model...")
        model_name = "facebook/nllb-200-distilled-600M"
        self.translator_tokenizer = AutoTokenizer.from_pretrained(model_name)
        self.translator_model = AutoModelForSeq2SeqLM.from_pretrained(model_name)
        self.translator_model.to(self.device)
        print("✓ Translation model loaded")
    
    def _load_generation_model(self, use_quantization: bool):
        """Load LLM for answer generation"""
        print("📥 Loading generation model (Llama 3.2)...")
        model_name = "meta-llama/Llama-3.2-3B-Instruct"
        
        self.generator_tokenizer = AutoTokenizer.from_pretrained(model_name)
        
        if use_quantization and self.device == "cuda":
            # Use 4-bit quantization to save VRAM
            quantization_config = BitsAndBytesConfig(
                load_in_4bit=True,
                bnb_4bit_compute_dtype=torch.float16,
                bnb_4bit_use_double_quant=True,
                bnb_4bit_quant_type="nf4"
            )
            self.generator_model = AutoModelForCausalLM.from_pretrained(
                model_name,
                quantization_config=quantization_config,
                device_map="auto"
            )
            print("✓ Generation model loaded (4-bit quantized)")
        else:
            self.generator_model = AutoModelForCausalLM.from_pretrained(
                model_name,
                torch_dtype=torch.float16 if self.device == "cuda" else torch.float32,
                device_map="auto"
            )
            print("✓ Generation model loaded")
    
    def _load_language_detector(self):
        """Load language detection model"""
        print("📥 Loading language detector...")
        self.language_detector = pipeline(
            "text-classification",
            model="facebook/fasttext-language-identification"
        )
        print("✓ Language detector loaded")
    
    def _initialize_vector_database(self):
        """Initialize ChromaDB for storing legal document embeddings"""
        print("📥 Initializing vector database...")
        self.chroma_client = chromadb.PersistentClient(path="./legal_database")
        self.collection = self.chroma_client.get_or_create_collection(
            name="sri_lankan_laws",
            metadata={"description": "Sri Lankan legal documents corpus"}
        )
        print("✓ Vector database initialized")
    
    def detect_language(self, text: str) -> str:
        """
        Detect the language of input text.
        
        Args:
            text: Input text
            
        Returns:
            Language code (eng_Latn, sin_Sinh, or tam_Tamil)
        """
        try:
            # Try ML-based detection
            result = self.language_detector(text)[0]
            lang_code = result['label'].replace('__label__', '')
            
            # Map to NLLB language codes
            lang_mapping = {
                'eng': 'eng_Latn',
                'sin': 'sin_Sinh',
                'tam': 'tam_Tamil'
            }
            return lang_mapping.get(lang_code[:3], 'eng_Latn')
        
        except Exception as e:
            # Fallback to Unicode-based detection
            if any('\u0D80' <= char <= '\u0DFF' for char in text):
                return "sin_Sinh"  # Sinhala
            elif any('\u0B80' <= char <= '\u0BFF' for char in text):
                return "tam_Tamil"  # Tamil
            return "eng_Latn"  # Default to English
    
    def translate(self, text: str, src_lang: str, tgt_lang: str) -> str:
        """
        Translate text between languages using NLLB.
        
        Args:
            text: Text to translate
            src_lang: Source language code
            tgt_lang: Target language code
            
        Returns:
            Translated text
        """
        # No translation needed if same language
        if src_lang == tgt_lang:
            return text
        
        # Set source language
        self.translator_tokenizer.src_lang = src_lang
        
        # Tokenize input
        inputs = self.translator_tokenizer(text, return_tensors="pt", padding=True)
        inputs = {k: v.to(self.device) for k, v in inputs.items()}
        
        # Generate translation
        translated_tokens = self.translator_model.generate(
            **inputs,
            forced_bos_token_id=self.translator_tokenizer.lang_code_to_id[tgt_lang],
            max_length=512,
            num_beams=5
        )
        
        # Decode translation
        translation = self.translator_tokenizer.batch_decode(
            translated_tokens,
            skip_special_tokens=True
        )[0]
        
        return translation
    
    def add_legal_documents(self, documents: List[str], metadata: List[Dict] = None):
        """
        Add legal documents to the vector database.
        
        Args:
            documents: List of legal document texts
            metadata: Optional metadata for each document
        """
        print(f"📚 Adding {len(documents)} documents to database...")
        
        # Generate embeddings
        embeddings = self.embedder.encode(documents, show_progress_bar=True)
        
        # Prepare metadata
        if metadata is None:
            metadata = [{"source": f"Document {i+1}"} for i in range(len(documents))]
        
        # Generate IDs
        ids = [f"doc_{i}" for i in range(len(documents))]
        
        # Add to collection
        self.collection.add(
            embeddings=embeddings.tolist(),
            documents=documents,
            metadatas=metadata,
            ids=ids
        )
        
        print(f"✅ Added {len(documents)} documents successfully")
    
    def search_legal_docs(self, query: str, n_results: int = 3) -> Tuple[List[str], List[Dict]]:
        """
        Search for relevant legal documents using semantic search.
        
        Args:
            query: Search query
            n_results: Number of results to return
            
        Returns:
            Tuple of (documents, metadata)
        """
        # Generate query embedding
        query_embedding = self.embedder.encode(query).tolist()
        
        # Search in ChromaDB
        results = self.collection.query(
            query_embeddings=[query_embedding],
            n_results=n_results
        )
        
        # Extract results
        if results['documents'] and len(results['documents'][0]) > 0:
            documents = results['documents'][0]
            metadata = results['metadatas'][0]
            return documents, metadata
        
        return [], []
    
    def generate_answer(self, context: str, question: str) -> str:
        """
        Generate answer using RAG (Retrieval-Augmented Generation).
        
        Args:
            context: Retrieved legal context
            question: User's question
            
        Returns:
            Generated answer
        """
        # Create prompt for Llama
        prompt = f"""<|begin_of_text|><|start_header_id|>system<|end_header_id|>

You are a legal assistant for LawConnect in Sri Lanka. Answer questions based on the provided legal context. 
Be clear, concise, and helpful. Always suggest consulting a qualified lawyer for specific cases.
<|eot_id|><|start_header_id|>user<|end_header_id|>

Context from Sri Lankan law:
{context}

Question: {question}

Please provide a clear answer in 2-3 sentences based on the context above.
<|eot_id|><|start_header_id|>assistant<|end_header_id|>

"""
        
        # Tokenize
        inputs = self.generator_tokenizer(prompt, return_tensors="pt")
        inputs = {k: v.to(self.generator_model.device) for k, v in inputs.items()}
        
        # Generate
        with torch.no_grad():
            outputs = self.generator_model.generate(
                **inputs,
                max_new_tokens=200,
                temperature=0.3,
                top_p=0.9,
                do_sample=True,
                pad_token_id=self.generator_tokenizer.eos_token_id
            )
        
        # Decode
        answer = self.generator_tokenizer.decode(outputs[0], skip_special_tokens=True)
        
        # Extract only assistant's response
        if "<|start_header_id|>assistant<|end_header_id|>" in answer:
            answer = answer.split("<|start_header_id|>assistant<|end_header_id|>")[-1].strip()
        
        return answer
    
    def needs_lawyer_consultation(self, message: str) -> bool:
        """
        Detect if the query requires lawyer consultation.
        
        Args:
            message: User's message
            
        Returns:
            True if lawyer consultation is recommended
        """
        urgent_keywords = [
            'court', 'arrest', 'sued', 'lawsuit', 'criminal charge',
            'detained', 'legal action', 'police', 'trial', 'prosecution'
        ]
        
        message_lower = message.lower()
        return any(keyword in message_lower for keyword in urgent_keywords)
    
    def chat(self, user_message: str, verbose: bool = False) -> Dict:
        """
        Main chat function - handles the complete conversation flow.
        
        Args:
            user_message: User's question/message
            verbose: Whether to print processing steps
            
        Returns:
            Dictionary with answer, disclaimer, sources, and metadata
        """
        if verbose:
            print(f"\n{'='*60}")
            print(f"👤 User: {user_message}")
            print(f"{'='*60}")
        
        # Step 1: Detect language
        user_lang = self.detect_language(user_message)
        if verbose:
            print(f"🌍 Detected language: {user_lang}")
        
        # Step 2: Translate to English for processing
        english_message = self.translate(user_message, user_lang, "eng_Latn")
        if verbose and user_lang != "eng_Latn":
            print(f"🔄 Translated to English: {english_message}")
        
        # Step 3: Search for relevant legal documents
        if verbose:
            print(f"🔍 Searching legal database...")
        documents, metadata = self.search_legal_docs(english_message)
        
        if not documents:
            return {
                "answer": self._get_no_info_message(user_lang),
                "disclaimer": self._get_disclaimer(user_lang),
                "sources": [],
                "language": user_lang,
                "requires_lawyer": True
            }
        
        if verbose:
            print(f"📚 Found {len(documents)} relevant documents")
        
        # Step 4: Generate answer using RAG
        context = "\n\n".join(documents)
        if verbose:
            print(f"🤖 Generating answer...")
        
        english_answer = self.generate_answer(context, english_message)
        
        # Step 5: Translate answer back to user's language
        if verbose and user_lang != "eng_Latn":
            print(f"🔄 Translating response to {user_lang}...")
        
        final_answer = self.translate(english_answer, "eng_Latn", user_lang)
        
        # Step 6: Check if lawyer consultation is needed
        requires_lawyer = self.needs_lawyer_consultation(english_message)
        
        # Step 7: Prepare response
        response = {
            "answer": final_answer,
            "disclaimer": self._get_disclaimer(user_lang),
            "sources": metadata,
            "language": user_lang,
            "requires_lawyer": requires_lawyer
        }
        
        if requires_lawyer:
            response["lawyer_suggestion"] = self._get_lawyer_suggestion(user_lang)
        
        if verbose:
            print(f"\n{'='*60}")
            print(f"🤖 Assistant: {response['answer']}")
            print(f"⚠️  {response['disclaimer']}")
            if requires_lawyer:
                print(f"⚖️  {response['lawyer_suggestion']}")
            print(f"{'='*60}\n")
        
        return response
    
    def _get_disclaimer(self, language: str) -> str:
        """Get disclaimer text in the appropriate language"""
        disclaimers = {
            "eng_Latn": "⚠️ This is educational information only, not legal advice. For your specific situation, please consult a qualified lawyer.",
            "sin_Sinh": "⚠️ මෙය අධ්‍යාපනික තොරතුරු පමණි, නීතිමය උපදෙස් නොවේ. ඔබේ විශේෂිත තත්වය සඳහා, කරුණාකර සුදුසුකම් ලත් නීතිඥයෙකුගෙන් උපදෙස් ලබා ගන්න.",
            "tam_Tamil": "⚠️ இது கல்வி தகவல் மட்டுமே, சட்ட ஆலோசனை அல்ல. உங்கள் குறிப்பிட்ட சூழ்நிலைக்கு, தகுதியான வழக்கறிஞரை அணுகவும்."
        }
        return disclaimers.get(language, disclaimers["eng_Latn"])
    
    def _get_no_info_message(self, language: str) -> str:
        """Get 'no information' message in the appropriate language"""
        messages = {
            "eng_Latn": "I don't have enough information to answer this specific question. Would you like me to connect you with a lawyer?",
            "sin_Sinh": "මෙම නිශ්චිත ප්‍රශ්නයට පිළිතුරු දීමට මට ප්‍රමාණවත් තොරතුරු නැත. ඔබව නීතිඥයෙකු සමඟ සම්බන්ධ කිරීමට ඔබ කැමතිද?",
            "tam_Tamil": "இந்த குறிப்பிட்ட கேள்விக்கு பதிலளிக்க எனக்கு போதுமான தகவல் இல்லை. உங்களை வழக்கறிஞருடன் இணைக்க விரும்புகிறீர்களா?"
        }
        return messages.get(language, messages["eng_Latn"])
    
    def _get_lawyer_suggestion(self, language: str) -> str:
        """Get lawyer consultation suggestion in the appropriate language"""
        suggestions = {
            "eng_Latn": "Based on your question, I strongly recommend consulting with a qualified lawyer. Would you like me to help you find one?",
            "sin_Sinh": "ඔබේ ප්‍රශ්නය මත පදනම්ව, සුදුසුකම් ලත් නීතිඥයෙකුගෙන් උපදෙස් ලබා ගැනීම මම දැඩි ලෙස නිර්දේශ කරමි. එකක් සොයා ගැනීමට මම ඔබට උදව් කළ යුතුද?",
            "tam_Tamil": "உங்கள் கேள்வியின் அடிப்படையில், தகுதியான வழக்கறிஞரை அணுகுமாறு நான் உறுதியாக பரிந்துரைக்கிறேன். ஒருவரைக் கண்டுபிடிக்க நான் உதவ வேண்டுமா?"
        }
        return suggestions.get(language, suggestions["eng_Latn"])


# Example usage
if __name__ == "__main__":
    print("🚀 Starting LawConnect Chatbot Demo\n")
    
    # Initialize chatbot
    chatbot = LawConnectChatbot(use_gpu=True, use_quantization=True)
    
    # Load sample legal documents (Replace with real Sri Lankan legal documents)
    sample_documents = [
        "The Rent Act in Sri Lanka protects tenants from unlawful eviction. Landlords must provide written notice before eviction. A minimum notice period is required by law. Eviction must have lawful grounds such as non-payment of rent or property damage. Court order is needed for forced removal of tenants.",
        
        "Consumer Affairs Authority Act protects consumers from misleading advertisements and defective goods. If you purchase a product that doesn't match advertised specifications, you have the right to a refund or replacement. Sellers cannot refuse returns based on 'opened package' policies if the product is defective.",
        
        "Shop and Office Employees Act requires employers to pay wages on time. Employers cannot withhold wages for alleged damages without proper legal process. If your employer doesn't pay your salary, you can file a complaint with the Labour Tribunal. The tribunal can order payment of due wages.",
        
        "Under the Kandyan Marriage Law, marriage age, divorce process, and inheritance rules are specific to Kandyan Sinhalese couples. Muslim couples are governed by the Muslim Marriage and Divorce Act with different standards. The legal system varies based on geographic, linguistic, and socio-economic contexts."
    ]
    
    sample_metadata = [
        {"source": "Rent Act", "category": "Property Law"},
        {"source": "Consumer Affairs Authority Act", "category": "Consumer Protection"},
        {"source": "Shop and Office Employees Act", "category": "Employment Law"},
        {"source": "Kandyan Marriage Law & Muslim Marriage Act", "category": "Family Law"}
    ]
    
    # Add documents to database
    chatbot.add_legal_documents(sample_documents, sample_metadata)
    
    # Test queries
    test_queries = [
        "Can my landlord evict me without notice?",
        "I bought a laptop that doesn't work. Can I get a refund?",
        "My employer hasn't paid my salary for 2 months. What can I do?",
    ]
    
    print("\n" + "="*60)
    print("TESTING CHATBOT WITH SAMPLE QUERIES")
    print("="*60 + "\n")
    
    for query in test_queries:
        response = chatbot.chat(query, verbose=True)
        input("\nPress Enter to continue to next query...\n")
    
    print("\n✅ Demo completed!")
