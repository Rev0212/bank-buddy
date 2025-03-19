# 🏦 Bank Buddy – AI-Powered Loan Assistance

**Bank Buddy** is an AI-powered virtual branch manager that streamlines loan applications using video-based customer interaction. It offers a seamless, branch-like experience with real-time guidance, document submission, and eligibility evaluation.

## 🚀 Features
- **AI Manager:** Provides structured financial guidance via video interaction.  
- **Document Handling:** Secure document submission and verification.  
- **Loan Eligibility:** Real-time analysis of eligibility based on user input.  
- **Multi-language Support:** Expands accessibility to a broader user base.  
- **User-Friendly Interface:** Clean, responsive, and intuitive UI.  

## 🏗️ Architecture Overview
- **Frontend:** React-based interface for customer interaction.  
- **Backend:** Python-based Flask server handling business logic.  
- **AI Models:** TensorFlow and OpenCV for video-based AI processing.  
- **Database:** PostgreSQL/MySQL for data storage and management.  

## 📂 Project Structure
```plaintext
├── client/               # Frontend (React)
├── python_services/      # AI models and backend logic
├── server/               # API and server setup
├── README.md             # Project documentation
├── LICENSE               # License information
└── .gitignore            # Ignored files  
```

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

## ✅ API Endpoints
| Endpoint             | Method | Description                         |
|---------------------|--------|-------------------------------------|
| `/api/login`         | POST   | User login and authentication       |
| `/api/submit-loan`   | POST   | Submit loan application data        |
| `/api/check-eligibility` | GET   | Check loan eligibility             |

## 🧪 Testing
- Run tests using Jest and PyTest:  
```bash
npm test  
pytest  
```

## 🚀 Deployment
- Deploy frontend and backend separately using Docker:  
```bash
docker-compose up  
```

## 📌 Roadmap
- [ ] Enhance AI accuracy with real-world data.  
- [ ] Integrate biometric authentication.  
- [ ] Improve multilingual support.  

## 🤝 Contributing
Contributions are welcome! Open an issue or submit a pull request.  
