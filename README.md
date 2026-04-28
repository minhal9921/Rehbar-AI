# 🎓 Rehbar AI — Intelligent Career Counselor

**Rehbar AI** is a minimalist, intelligent career counseling platform designed to help students and professionals navigate their career paths with clarity. Built as part of the **Google AI Seekho Hackathon 🇵🇰**, it leverages state-of-the-art Generative AI to provide personalized guidance.

🔗 **Live Demo:** [rehbarai.tech](https://rehbarai.tech/)

---

## 🌟 Key Features
- **Smart Career Guidance:** Powered by Gemini 1.5 Flash for nuanced and context-aware counseling.
- **Minimalist UI:** Clean and fast user interface built with React and Vite.
- **Production-Ready:** Fully containerized using Docker and deployed on enterprise-grade infrastructure.
- **Scalable Backend:** Integrated with Vertex AI for Firebase for seamless AI communication.

## 🛠️ Tech Stack
- **Frontend:** React.js, Vite, Tailwind CSS
- **AI/ML:** Google Gemini 1.5 Flash (via Vertex AI)
- **Backend/SDK:** Firebase SDK for Cloud Functions/Vertex AI
- **DevOps:** Docker, Google Cloud Run (Serverless Deployment)
- **Cloud:** Google Cloud Platform (GCP)

## 🏗️ Architecture
1. **User Input:** Captured via a responsive React frontend.
2. **Processing:** Requests are sent through the Vertex AI for Firebase SDK.
3. **AI Brain:** Gemini 1.5 Flash processes the query using optimized system prompts for career coaching.
4. **Deployment:** The entire app is containerized in a Docker image and served via Google Cloud Run for high availability.

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- Docker (Optional, for containerization)
- Firebase/GCP Account

### Installation
1. Clone the repo:
   ```bash
   git clone [https://github.com/your-username/rehbar-ai.git](https://github.com/your-username/rehbar-ai.git)
Install dependencies:

Bash
npm install
Set up environment variables in a .env file (refer to .env.example).

Run the development server:

Bash
npm run dev
