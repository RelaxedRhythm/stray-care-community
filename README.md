# 🐾 PawCircle

PawCircle is a full-stack MERN application that connects citizens, volunteers, and administrators to improve stray animal welfare. The platform streamlines case reporting, volunteer coordination, fundraising, and case management through role-based dashboards and secure authentication.

---

## ✨ Features

- 🐶 Report stray animal rescue cases
- 🙋 Volunteer registration and coordination
- 💰 Secure online donations via Razorpay
- 📂 Track rescue cases and status updates
- 👤 Role-based dashboards for Users, Volunteers, and Admins
- 🔐 JWT-based authentication and authorization
- 📊 Admin panel for approvals and platform management
- 📱 Responsive design for desktop and mobile

---

## 🛠 Tech Stack

### Frontend
- React.js
- Tailwind CSS
- React Router
- Axios

### Backend
- Node.js
- Express.js

### Database
- MongoDB
- Mongoose

### Authentication
- JWT (JSON Web Tokens)

### Payment Gateway
- Razorpay

---

## 📂 Project Structure

```text
PawCircle/
├── client/
│   ├── src/
│   ├── public/
│   └── ...
│
├── server/
│   ├── controllers/
│   ├── routes/
│   ├── middleware/
│   ├── models/
│   ├── config/
│   └── ...
│
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+)
- MongoDB
- npm

---

### Clone the Repository

```bash
git clone https://github.com/your-username/pawcircle.git
cd pawcircle
```

---

### Install Dependencies

#### Frontend

```bash
cd client
npm install
```

#### Backend

```bash
cd ../server
npm install
```

---

### Configure Environment Variables

Create a `.env` file inside the `server` directory.

```env
PORT=5000

MONGODB_URI=your_mongodb_connection_string

JWT_SECRET=your_jwt_secret

RAZORPAY_KEY_ID=your_key_id
RAZORPAY_KEY_SECRET=your_key_secret
```

---

### Run the Application

Start the backend:

```bash
cd server
npm run dev
```

Start the frontend:

```bash
cd client
npm run dev
```

The application will be available at:

```
http://localhost:5173
```

---

## 👥 User Roles

### User
- Register and log in
- Report stray animal cases
- Donate to welfare campaigns
- Track submitted cases

### Volunteer
- View assigned rescue cases
- Update rescue progress
- Coordinate with administrators

### Admin
- Manage users and volunteers
- Approve fundraising requests
- Monitor donations
- Oversee rescue operations
- Manage reported cases

---

## 🔒 Security Features

- JWT Authentication
- Password hashing
- Role-Based Access Control (RBAC)
- Protected API routes
- Input validation
- Secure payment processing with Razorpay

---

## 🚧 Future Improvements

- 📍 Live GPS tracking for rescue cases
- 🔔 Email and SMS notifications
- 🤖 AI-assisted case prioritization
- 💬 Real-time volunteer chat
- 📈 Analytics dashboard
- 📷 Image recognition for animal identification
- 📱 Progressive Web App (PWA)
- 🌐 Multi-language support

---

## 🤝 Contributing

Contributions are welcome!

1. Fork the repository
2. Create a new feature branch

```bash
git checkout -b feature/your-feature
```

3. Commit your changes

```bash
git commit -m "Add your feature"
```

4. Push to GitHub

```bash
git push origin feature/your-feature
```

5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## ⭐ Support

If you found this project useful, consider giving it a ⭐ on GitHub!
