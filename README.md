# TTS Chat Application

A real-time chat application with Text-to-Speech functionality, built with Firebase and vanilla JavaScript.

## Features

- 🗣️ **Text-to-Speech** - Every message is read aloud with customizable voice settings
- 💬 **Real-time Chat** - Messages sync instantly across all users
- 🖼️ **Media Support** - Share images and videos
- 💻 **Code Blocks** - Discord-style code sharing with syntax highlighting and copy button
- 🎨 **Modern UI** - Beautiful gradient design with smooth animations
- ⚙️ **Voice Customization** - Adjust speed, pitch, volume, and choose from available voices

## Live Demo

Visit: [Your GitHub Pages URL]

## Setup Instructions

### 1. Firebase Configuration

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `tts-projet-fd867`
3. Go to **Realtime Database**
4. Set the following rules (for testing):

```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

⚠️ **Note**: These are permissive rules for testing. For production, implement proper authentication.

### 2. Local Development

1. Clone this repository
2. Open `index.html` in your browser
3. Enter a username and start chatting!

### 3. Deploy to GitHub Pages

This repository is configured to automatically deploy to GitHub Pages on every push to the `main` branch.

#### Enable GitHub Pages:

1. Go to your repository **Settings**
2. Navigate to **Pages** (in the left sidebar)
3. Under **Source**, select: `GitHub Actions`
4. Push your code to the `main` branch
5. The workflow will automatically deploy your site

Your site will be available at: `https://[your-username].github.io/[repository-name]/`

## File Structure

```
├── index.html          # Main HTML file
├── styles.css          # All styling
├── config.js           # Firebase configuration
├── app.js              # Application logic
├── firebase-test.html  # Connection testing tool
└── .github/
    └── workflows/
        └── deploy.yml  # GitHub Pages deployment workflow
```

## Usage

### Sending Messages

Simply type your message in the input box and press Enter or click the send button.

### Uploading Media

Click the image icon to upload photos or videos from your device.

### Code Blocks

To share code, wrap it in triple backticks with the language name:

\`\`\`javascript
console.log("Hello, World!");
\`\`\`

### Voice Settings

1. Click the settings gear icon
2. Choose your preferred voice
3. Adjust speed, pitch, and volume
4. Toggle TTS on/off

## Browser Compatibility

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support (may have limited voice options)

## Troubleshooting

### Messages not appearing?

1. Check Firebase Console → Realtime Database → Data tab
2. Verify database rules are set correctly
3. Open browser console (F12) for error messages

### TTS not working?

1. Make sure TTS is enabled in settings
2. Check browser permissions for audio
3. Try a different voice from the dropdown

### Deploy failing?

1. Check that GitHub Pages is enabled in repository settings
2. Verify the workflow file is in `.github/workflows/deploy.yml`
3. Check the Actions tab for detailed error logs

## Security Considerations

Before deploying to production:

1. **Implement Firebase Authentication**
2. **Update database rules** to require authentication
3. **Add rate limiting** to prevent spam
4. **Sanitize user input** to prevent XSS attacks
5. **Consider adding moderation** features

## Contributing

Feel free to open issues or submit pull requests!

## License

MIT License - feel free to use this project for learning or personal use.