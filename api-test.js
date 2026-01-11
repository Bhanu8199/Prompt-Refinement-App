import fetch from 'node-fetch';
import fs from 'fs';

async function testAPI() {
  const BASE_URL = 'http://127.0.0.1:5003';
  const results = [];

  try {
    console.log('Testing API endpoints on', BASE_URL);

    // Test POST /api/prompts/refine with different text inputs
    const testInputs = [
      'Create a todo app with React',
      'Build an API for user authentication',
      'Make a login system',
      'Develop a task management application',
      'Create a simple website'
    ];

    for (let i = 0; i < testInputs.length; i++) {
      console.log(`Testing input: "${testInputs[i]}"`);

      const formData = new FormData();
      formData.append('input_text', testInputs[i]);
      formData.append('source_type', 'text');

      try {
        const postResponse = await fetch(`${BASE_URL}/api/prompts/refine`, {
          method: 'POST',
          body: formData,
        });

        const result = {
          input: testInputs[i],
          status: postResponse.status,
          statusText: postResponse.statusText
        };

        if (postResponse.ok) {
          const postData = await postResponse.json();
          result.data = postData;

          // Validate the refined output structure
          try {
            const refinedOutput = JSON.parse(postData.refinedPrompt);
            const requiredFields = ['primaryIntent', 'functionalExpectations', 'technicalConstraints', 'expectedOutputs', 'ambiguities', 'missingInformation', 'confidenceScore'];

            let valid = true;
            for (const field of requiredFields) {
              if (!(field in refinedOutput)) {
                valid = false;
                result.missingField = field;
                break;
              }
            }

            if (valid) {
              if (!Array.isArray(refinedOutput.functionalExpectations) ||
                  !Array.isArray(refinedOutput.technicalConstraints) ||
                  !Array.isArray(refinedOutput.expectedOutputs) ||
                  !Array.isArray(refinedOutput.ambiguities) ||
                  !Array.isArray(refinedOutput.missingInformation)) {
                valid = false;
                result.arrayError = true;
              }

              if (typeof refinedOutput.confidenceScore !== 'number' ||
                  refinedOutput.confidenceScore < 0 || refinedOutput.confidenceScore > 1) {
                valid = false;
                result.confidenceError = true;
              }
            }

            result.valid = valid;
            result.refinedOutput = refinedOutput;
          } catch (parseError) {
            result.parseError = parseError.message;
            result.valid = false;
          }
        } else {
          const errorText = await postResponse.text();
          result.error = errorText;
        }

        results.push(result);
      } catch (fetchError) {
        results.push({
          input: testInputs[i],
          fetchError: fetchError.message
        });
      }
    }

    // Write results to file
    fs.writeFileSync('api-test-results.json', JSON.stringify(results, null, 2));
    console.log('Test completed. Results written to api-test-results.json');

  } catch (error) {
    fs.writeFileSync('api-test-error.json', JSON.stringify({ error: error.message }, null, 2));
    console.error('Test failed:', error.message);
  }
}

testAPI();
