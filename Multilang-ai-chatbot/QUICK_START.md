# 🚀 Quick Start Guide - Medical Chatbot Frontend

## ✅ What's Been Created

I've created a **modern, beautiful web frontend** for your Medical Chatbot with:

- ✨ **Beautiful UI** - Modern gradient design with smooth animations
- 💬 **Chat Interface** - Real-time chat experience
- 🌍 **13 Languages** - Multilingual support
- 📱 **Responsive Design** - Works on desktop and mobile
- ⚡ **Fast & Smooth** - Optimized performance

## 🎯 How to Run

### Step 1: Start the Flask Backend

Open PowerShell or Terminal and run:

```powershell
cd "C:\My Stuff\LPU\SEM 7\Multilang-ai-chatbot"
python app.py
```

You should see:
```
 * Running on http://127.0.0.1:5000
```

### Step 2: Open in Browser

Once the server is running, open your browser and go to:

**👉 http://localhost:5000**

That's it! The chatbot interface will load automatically.

## 🎨 Features

1. **Ask Health Questions** - Type your symptoms or health concerns
2. **Get Medical Suggestions** - Click "Get Response" for disease analysis
3. **Health Tips** - Click "Health Tip" for personalized advice
4. **Multilingual** - Select from 13 languages from the dropdown
5. **Real-time Chat** - See responses appear instantly

## 📁 Project Structure

```
Multilang-ai-chatbot/
├── app.py                 # Flask backend server
├── chat.py                # Original Streamlit version (kept for reference)
├── static/
│   ├── index.html         # Frontend HTML
│   ├── style.css          # Beautiful styling
│   └── script.js          # Frontend JavaScript
├── dataset - Sheet1.csv   # Medical dataset
└── requirements.txt       # Dependencies
```

## 🔧 Troubleshooting

### If the page doesn't load:
1. Make sure Flask is running (`python app.py`)
2. Check that port 5000 is not in use
3. Try `http://127.0.0.1:5000` instead

### If you get API errors:
1. Make sure all dependencies are installed: `pip install -r requirements.txt`
2. Check that the dataset file exists
3. Look at the terminal for error messages

## 🎉 Enjoy Your Chatbot!

The interface is now ready to use. Just start the Flask server and open your browser!

