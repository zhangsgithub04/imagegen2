# Setup Instructions for AI Image Generator

## ✅ **SOLUTION: Dual API Support Added!**

The application now supports **both Google Gemini and OpenAI DALL-E 3** APIs! You can choose which one to use in the interface.

## Quick Start Options

### Option 1: OpenAI DALL-E 3 (Recommended - Easier Setup)

1. **Get OpenAI API Key:**
   - Go to [OpenAI Platform](https://platform.openai.com/api-keys)
   - Create an account and add billing
   - Generate an API key

2. **Add to Environment:**
   ```bash
   # Add this to your .env.local file
   OPENAI_API_KEY=your_openai_api_key_here
   ```

3. **Test the Application:**
   - Select "OpenAI DALL-E 3" in the interface
   - Enter a prompt and generate!

**Cost:** $0.04 per image (1024x1024 high quality)

### Option 2: Google Gemini (Original - Requires More Setup)

1. **Set up Google Cloud Billing:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Enable billing on your project
   - Enable the Imagen API

2. **Get API Key:**
   - Go to APIs & Services → Credentials
   - Create an API Key
   - Restrict it to Imagen API

3. **Add to Environment:**
   ```bash
   # Add this to your .env.local file  
   GOOGLE_AI_API_KEY=your_google_ai_api_key_here
   ```

**Cost:** Variable pricing, typically lower for smaller images

## Current Status

### ✅ What's Working:
- **OpenAI DALL-E 3**: Ready to use immediately with API key
- **MongoDB**: Storing and retrieving images
- **Gallery**: Viewing, downloading, and deleting images
- **Responsive UI**: Works on desktop and mobile

### ⚠️ Known Issues:
- **Google Gemini**: The `@google/genai` SDK may not support image generation yet
- **Model Names**: Google's model names are different than expected

## Environment Variables Needed

Add these to your `.env.local` file:

```bash
# MongoDB (Required)
MONGODB_URI=your_mongodb_connection_string_here

# At least one of these APIs:
OPENAI_API_KEY=your_openai_api_key_here          # For DALL-E 3
GOOGLE_AI_API_KEY=your_google_ai_api_key_here    # For Gemini (if working)
```

## Troubleshooting

### "Models not found" Error
- This suggests the Google GenAI SDK doesn't support the expected image models
- **Solution**: Use OpenAI option instead

### "Billing required" Error  
- Google Imagen requires billing setup
- **Solution**: Either set up billing or use OpenAI option

### MongoDB Connection Issues
- Make sure MongoDB is running (local) or connection string is correct (Atlas)
- Check network access in MongoDB Atlas

## Cost Comparison

| API | Cost per Image | Image Size | Setup Difficulty |
|-----|---------------|------------|------------------|
| OpenAI DALL-E 3 | $0.04 | 1024x1024 | Easy ⭐ |
| Google Imagen | ~$0.02-$0.04 | Variable | Hard ⭐⭐⭐ |

## Recommended Workflow

1. **Start with OpenAI** - It's easier to set up and test
2. **Add your OpenAI API key** to .env.local  
3. **Test image generation** with a simple prompt
4. **Add Google Gemini later** if you want to compare options

The application will work great with just OpenAI for now!
