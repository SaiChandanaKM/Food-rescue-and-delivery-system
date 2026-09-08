# ⚙️ RescueMeal - Backend API Server

This is the Node.js / Express backend server for the RescueMeal surplus food donation platform. It manages REST endpoints, connects to MongoDB, handles user authentication (JWT), and performs AI-based safety expiry calculations.

For the comprehensive setup guide and system details, please refer to the main [Root README.md](../README.md).

---

## 🛠️ Technologies Used

*   **Node.js & Express.js:** API server implementation.
*   **MongoDB & Mongoose:** Database document models and schemas.
*   **JWT (JSON Web Tokens):** Stateless authentication guards.
*   **BcryptJS:** Hashing for password security.
*   **Multer + Cloudinary:** Multi-part file uploads with local backup fallback.

---

## ⚙️ Environment Variables Setup

Create a `.env` file in this directory:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/rescuemeal
JWT_SECRET=your_jwt_secret_here

# Optional Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

---

## 🚀 Running Locally

Ensure dependencies are installed and MongoDB is running on port `27017`:

```bash
npm install
npm start
```

The server will run on [http://localhost:5000](http://localhost:5000).
