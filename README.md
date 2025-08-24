# AI Image Generator with Gemini

A modern Next.js application that generates images using Google's Gemini AI and stores them in MongoDB. Built with shadcn/ui components and optimized for minimal API costs.

## Features

- 🎨 **AI Image Generation** - Generate images using Google's Gemini AI
- 💾 **MongoDB Storage** - All generated images are stored in MongoDB
- 💰 **Cost Optimized** - Configured to use the smallest image sizes to minimize API costs
- 🎯 **Modern UI** - Built with shadcn/ui components and Tailwind CSS
- ⚡ **Next.js 14** - Uses App Router for optimal performance
- 🔄 **Real-time Updates** - Images appear instantly in the gallery
- 📱 **Responsive Design** - Works great on desktop and mobile

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Database**: MongoDB with Mongoose
- **AI**: Google Gemini API
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ 
- MongoDB (local or Atlas)
- Google AI API Key

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env.local
   ```
   
   Fill in your environment variables in `.env.local`:
   ```
   GOOGLE_AI_API_KEY=your_google_ai_api_key_here
   MONGODB_URI=your_mongodb_connection_string_here
   ```

3. **Get your Google AI API Key:**
   - Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
   - Create a new API key
   - Copy it to your `.env.local` file

4. **Set up MongoDB:**
   - **Local MongoDB**: `mongodb://localhost:27017/imagegeneration`
   - **MongoDB Atlas**: `mongodb+srv://username:password@cluster.mongodb.net/imagegeneration`

5. **Run the development server:**
   ```bash
   npm run dev
   ```

6. **Open [http://localhost:3000](http://localhost:3000)** in your browser

## Usage

1. **Generate Images**: Enter a descriptive prompt and click "Generate Image"
2. **View Gallery**: All generated images appear in the gallery with their prompts
3. **Download Images**: Click the download button to save images locally
4. **Delete Images**: Remove unwanted images from the database

## Cost Optimization

This application is configured to minimize API costs:

- **Single Image Generation**: Only generates 1 image per request by default
- **Smallest Size**: Uses optimized settings for minimal image dimensions
- **Square Format**: Uses 1:1 aspect ratio which is typically most cost-effective

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GOOGLE_AI_API_KEY` | Your Google AI API key for Gemini | Yes |
| `MONGODB_URI` | MongoDB connection string | Yes |
