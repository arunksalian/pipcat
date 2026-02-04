# Pipcat Demo Project

A demonstration project showcasing the capabilities of the [Pipcat](https://github.com/pipecat-ai/pipecat) framework for building real-time voice and multimodal conversational AI applications.

## About Pipcat

Pipcat is an open-source Python framework designed for building voice and multimodal conversational AI agents. It provides a simple, modular architecture for creating real-time AI applications with support for:

- 🎤 Speech-to-Text (STT)
- 🤖 Large Language Models (LLMs)
- 🔊 Text-to-Speech (TTS)
- 📹 Video and image processing
- 🌐 WebRTC and telephony integration

## Features

This demo project demonstrates:

- Integration with various AI service providers (OpenAI, Anthropic, Google, etc.)
- Real-time voice conversations with AI agents
- Multimodal interactions (voice, text, images)
- WebRTC-based voice communication
- Custom pipeline configurations

## Prerequisites

- Python 3.8 or higher
- pip package manager
- API keys for the services you want to use (OpenAI, ElevenLabs, etc.)

## Installation

1. Clone this repository:
```bash
git clone <repository-url>
cd pipcat
```

2. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install Pipcat and dependencies:
```bash
pip install pipecat-ai
```

4. Install additional dependencies based on the services you want to use:
```bash
# For OpenAI support
pip install pipecat-ai[openai]

# For daily.co WebRTC support
pip install pipecat-ai[daily]

# For Silero VAD support
pip install pipecat-ai[silero]
```

## Configuration

Create a `.env` file in the project root with your API keys:

```env
OPENAI_API_KEY=your_openai_api_key
ELEVENLABS_API_KEY=your_elevenlabs_api_key
DAILY_API_KEY=your_daily_api_key
```

## Usage

### Web Interface

Start the web server:
```bash
python server.py
```

Then open your browser to `http://localhost:5000` to access the interactive web interface.

The web interface provides:
- Real-time voice conversation controls
- Visual audio feedback
- Message history
- Configurable LLM and TTS settings

### Basic Voice Bot Example

```python
import asyncio
from pipecat.pipeline.pipeline import Pipeline
from pipecat.services.openai import OpenAILLMService
from pipecat.services.elevenlabs import ElevenLabsTTSService

async def main():
    # Configure your pipeline here
    llm_service = OpenAILLMService(api_key="your-api-key")
    tts_service = ElevenLabsTTSService(api_key="your-api-key")
    
    # Build and run your pipeline
    pipeline = Pipeline([llm_service, tts_service])
    await pipeline.run()

if __name__ == "__main__":
    asyncio.run(main())
```

## Project Structure

```
pipcat/
├── README.md
├── requirements.txt
├── .env.example
├── server.py           # Flask backend
├── web/                # Web interface
│   ├── index.html      # Main UI
│   ├── styles.css      # Styling
│   └── app.js          # Frontend logic
├── examples/
│   ├── basic_chatbot.py
│   ├── voice_assistant.py
│   └── multimodal_agent.py
├── src/
│   └── (your custom code)
└── tests/
    └── (your tests)
```

## Examples

Check the `examples/` directory for sample implementations:

- **basic_chatbot.py** - Simple text-based chatbot
- **voice_assistant.py** - Real-time voice conversation
- **multimodal_agent.py** - Agent with vision capabilities

## Supported Services

### LLM Providers
- OpenAI (GPT-3.5, GPT-4)
- Anthropic (Claude)
- Google (Gemini)
- Azure OpenAI
- Local LLMs (via llamafile, Ollama)

### STT Providers
- Deepgram
- AssemblyAI
- Azure Speech
- Google Speech-to-Text
- Whisper (OpenAI)

### TTS Providers
- ElevenLabs
- PlayHT
- Cartesia
- Azure Speech
- Google Text-to-Speech

## Resources

- [Pipcat Documentation](https://docs.pipecat.ai)
- [Pipcat GitHub Repository](https://github.com/pipecat-ai/pipecat)
- [Community Discord](https://discord.gg/pipecat)
- [Example Applications](https://github.com/pipecat-ai/pipecat/tree/main/examples)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Built with [Pipcat](https://github.com/pipecat-ai/pipecat)
- Inspired by the amazing Pipcat community

## Support

For questions and support:
- Open an issue on GitHub
- Join the [Pipcat Discord community](https://discord.gg/pipecat)
- Check the [official documentation](https://docs.pipecat.ai)
