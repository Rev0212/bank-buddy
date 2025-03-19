# 🏦 Bank Buddy – AI-Powered Loan Assistance
**Demo Video** https://drive.google.com/file/d/1l9g6H54IkjxJ6pk0dC6NkvXRngrzTY-f/view?usp=sharing

**Bank Buddy** is an AI-powered virtual branch manager that streamlines loan applications using video-based customer interaction. It offers a seamless, branch-like experience with real-time guidance, document submission, and eligibility evaluation.

---

## 🚀 Features
- **AI Manager:** Provides structured financial guidance via video interaction.  
- **Document Handling:** Secure document submission and verification using OCR.  
- **Loan Eligibility:** Real-time analysis of eligibility based on user input.  
- **Multi-language Support:** Expands accessibility to a broader user base.  
- **Speech Recognition:** Real-time speech-to-text for better interaction.  

---

## 🏗️ Architecture Overview
- **Frontend:** React-based interface for customer interaction.  
- **Backend:** Python-based Flask server handling business logic.  
- **AI Models:** TensorFlow and OpenCV for video-based AI processing.  
- **Database:** PostgreSQL/MySQL for data storage and management.  
- **OCR & Google API:** For document scanning, text extraction, and speech recognition.  

---

## 🛠️ Tech Stack
### **Frontend**
- **React.js** – Component-based structure for dynamic and responsive UI.  
- **Redux** – State management for predictable state updates.  
- **Tailwind CSS** – Utility-based styling for fast, responsive design.  
- **Axios** – HTTP client for API communication.  

### **Backend**
- **Python (Flask)** – Lightweight framework for building RESTful APIs.  
- **FastAPI** – High-performance web framework (if used).  
- **TensorFlow** – For deep learning models handling video-based interactions.  
- **OpenCV** – Image and video processing for real-time interactions.  

### **AI/ML**
- **Transfer Learning** – Using pre-trained models for fast development.  
- **Natural Language Processing (NLP)** – For speech-to-text and intent recognition.  
- **Face Recognition** – Secure authentication using OpenCV and dlib.  
- **Speech Recognition** – Real-time audio-to-text conversion.  

### **OCR (Optical Character Recognition)**
- **Google Cloud Vision API** – Used to extract text from submitted documents.  
- **Tesseract** – Open-source OCR engine for offline processing.  

### **Google API**
- **Google Cloud Speech-to-Text API** – Converts audio from video interactions into text.  
- **Google Cloud Translate API** – Supports multi-language support.  
- **Google Cloud Storage** – Secure storage for customer documents.  

### **Database**
- **PostgreSQL/MySQL** – For structured storage of user and loan data.  
- **Redis** – Caching for fast data retrieval and state management.  

### **Infrastructure**
- **Docker** – For containerized deployment.  
- **NGINX** – Reverse proxy and load balancing.  
- **AWS S3** – Secure storage for customer documents.  

---

## 📂 Project Structure
```plaintext
├── client/               # Frontend (React)
├── python_services/      # AI models and backend logic
├── server/               # API and server setup
├── README.md             # Project documentation
├── LICENSE               # License information
└── .gitignore            # Ignored files  
```

---

## 🎯 Setup and Installation
1. **Clone the repository**  
```bash
git clone https://github.com/Rev0212/bank-buddy.git
```
2. **Frontend Setup**  
```bash
cd bank-buddy/client  
npm install  
npm start  
```
3. **Backend Setup**  
```bash
cd ../python_services  
pip install -r requirements.txt  
python app.py  
```

---

## ✅ API Endpoints
| Endpoint             | Method | Description                         |
|---------------------|--------|-------------------------------------|
| `/api/login`         | POST   | User login and authentication       |
| `/api/submit-loan`   | POST   | Submit loan application data        |
| `/api/check-eligibility` | GET   | Check loan eligibility             |
| `/api/upload-doc`     | POST   | Upload documents for OCR           |
| `/api/speech-to-text` | POST   | Convert speech to text using Google API |

---

## 🧪 Testing
- Run tests using Jest and PyTest:  
```bash
npm test  
pytest  
```

---

## 🚀 Deployment
- Deploy frontend and backend separately using Docker:  
```bash
docker-compose up  
```

---

## 📌 Roadmap
- [ ] Enhance AI accuracy with real-world data.  
- [ ] Integrate biometric authentication.  
- [ ] Improve multilingual support.  
- [ ] Expand document formats for OCR processing.  

---


