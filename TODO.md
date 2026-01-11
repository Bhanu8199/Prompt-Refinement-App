# Replace Gemini with Hugging Face Mistral-7B-Instruct-v0.2

- [x] Update .env to add HUGGINGFACE_API_KEY
- [x] Install node-fetch dependency
- [x] Remove Gemini imports and setup from server/routes.ts
- [x] Create refineWithHuggingFace function in server/routes.ts
- [x] Replace Gemini logic in refine endpoint with Hugging Face call
- [x] Update fallback response to match schema
- [x] Restart server and test API
- [x] Update .env with actual Hugging Face API key
