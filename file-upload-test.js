import fetch from 'node-fetch';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';

async function testFileUpload() {
  const BASE_URL = 'http://127.0.0.1:5003';
  console.log('Testing file upload functionality on', BASE_URL);

  try {
    // Test with a simple text file first
    console.log('\n1. Testing with text file...');
    const textFilePath = 'test-file.txt';
    fs.writeFileSync(textFilePath, 'Create a todo application with user authentication');

    const formData = new FormData();
    formData.append('file', fs.createReadStream(textFilePath));
    formData.append('source_type', 'document');

    const response = await fetch(`${BASE_URL}/api/prompts/refine`, {
      method: 'POST',
      body: formData,
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Text file upload successful');
      const refinedOutput = JSON.parse(data.refinedPrompt);
      console.log('Primary Intent:', refinedOutput.primaryIntent);
      console.log('Confidence Score:', refinedOutput.confidenceScore);
    } else {
      console.log('❌ Text file upload failed:', response.status, response.statusText);
    }

    // Clean up
    fs.unlinkSync(textFilePath);

    // Test with image file (if exists)
    const imagePath = 'attached_assets/image_1767978633686.png';
    if (fs.existsSync(imagePath)) {
      console.log('\n2. Testing with image file...');
      const imageFormData = new FormData();
      imageFormData.append('file', fs.createReadStream(imagePath));
      imageFormData.append('source_type', 'image');

      const imageResponse = await fetch(`${BASE_URL}/api/prompts/refine`, {
        method: 'POST',
        body: imageFormData,
      });

      if (imageResponse.ok) {
        const imageData = await imageResponse.json();
        console.log('✅ Image file upload successful');
        console.log('Original Input:', imageData.originalInput);
        const refinedOutput = JSON.parse(imageData.refinedPrompt);
        console.log('Primary Intent:', refinedOutput.primaryIntent);
        console.log('Confidence Score:', refinedOutput.confidenceScore);
      } else {
        console.log('❌ Image file upload failed:', imageResponse.status, imageResponse.statusText);
      }
    } else {
      console.log('\n2. Image file not found, skipping image test');
    }

    // Test with PDF file (create a simple one if possible)
    console.log('\n3. Testing with mock PDF scenario...');
    // Since we can't easily create PDFs, test the fallback logic
    const mockFormData = new FormData();
    // This will simulate a failed extraction
    mockFormData.append('input_text', '');
    mockFormData.append('source_type', 'document');

    const mockResponse = await fetch(`${BASE_URL}/api/prompts/refine`, {
      method: 'POST',
      body: mockFormData,
    });

    if (mockResponse.ok) {
      const mockData = await mockResponse.json();
      console.log('✅ Mock document test successful');
      const refinedOutput = JSON.parse(mockData.refinedPrompt);
      console.log('Primary Intent:', refinedOutput.primaryIntent);
      console.log('Confidence Score:', refinedOutput.confidenceScore);
    } else {
      console.log('❌ Mock document test failed:', mockResponse.status, mockResponse.statusText);
    }

    console.log('\n✅ File upload tests completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testFileUpload();
