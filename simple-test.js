import fetch from 'node-fetch';
import fs from 'fs';

async function testAPI() {
  const BASE_URL = 'http://127.0.0.1:5003';
  console.log('Testing API endpoints on', BASE_URL);

  const results = [];

  try {
    // Test GET /api/prompts (should return empty array initially)
    console.log('1. Testing GET /api/prompts...');
    const getResponse = await fetch(`${BASE_URL}/api/prompts`);
    const getData = await getResponse.json();
    console.log('GET response:', getData);
    results.push({ test: 'GET /api/prompts', status: getResponse.status, data: getData });

    // Test POST /api/prompts/refine with different text inputs
    const testInputs = [
      'Create a todo app with React',
      'Build an API for user authentication',
      'Make a login system',
      'Develop a task management application',
      'Create a simple website'
    ];

    for (let i = 0; i < testInputs.length; i++) {
      console.log(`\n2.${i + 1}. Testing POST /api/prompts/refine with text: "${testInputs[i]}"`);
      const formData = new FormData();
      formData.append('input_text', testInputs[i]);
      formData.append('source_type', 'text');

      const postResponse = await fetch(`${BASE_URL}/api/prompts/refine`, {
        method: 'POST',
        body: formData,
      });

      if (postResponse.ok) {
        const postData = await postResponse.json();
        console.log('POST response:', JSON.stringify(postData, null, 2));

        // Validate the refined output structure
        try {
          const refinedOutput = JSON.parse(postData.refinedPrompt);
          const requiredFields = ['primaryIntent', 'functionalExpectations', 'technicalConstraints', 'expectedOutputs', 'ambiguities', 'missingInformation', 'confidenceScore'];

          let valid = true;
          for (const field of requiredFields) {
            if (!(field in refinedOutput)) {
              console.log(`❌ Missing required field: ${field}`);
              valid = false;
            }
          }

          if (!Array.isArray(refinedOutput.functionalExpectations) ||
              !Array.isArray(refinedOutput.technicalConstraints) ||
              !Array.isArray(refinedOutput.expectedOutputs) ||
              !Array.isArray(refinedOutput.ambiguities) ||
              !Array.isArray(refinedOutput.missingInformation)) {
            console.log('❌ Some fields are not arrays as expected');
            valid = false;
          }

          if (typeof refinedOutput.confidenceScore !== 'number' ||
              refinedOutput.confidenceScore < 0 || refinedOutput.confidenceScore > 1) {
            console.log('❌ confidenceScore is not a valid number between 0 and 1');
            valid = false;
          }

          if (valid) {
            console.log('✅ Output structure is valid!');
          } else {
            console.log('❌ Output structure is invalid!');
          }

          results.push({
            test: `POST with "${testInputs[i]}"`,
            status: postResponse.status,
            valid,
            refinedOutput
          });
        } catch (parseError) {
          console.log('❌ Failed to parse refined output:', parseError.message);
          results.push({
            test: `POST with "${testInputs[i]}"`,
            status: postResponse.status,
            error: parseError.message
          });
        }

      } else {
        console.log('❌ POST request failed:', postResponse.status, postResponse.statusText);
        const errorText = await postResponse.text();
        console.log('Error details:', errorText);
        results.push({
          test: `POST with "${testInputs[i]}"`,
          status: postResponse.status,
          error: errorText
        });
      }
    }

    // Test GET again to see if the prompts were stored
    console.log('\n3. Testing GET /api/prompts after creating prompts...');
    const getResponse2 = await fetch(`${BASE_URL}/api/prompts`);
    const getData2 = await getResponse2.json();
    console.log('GET response after creation:', getData2.length, 'prompts stored');
    results.push({ test: 'GET /api/prompts after creation', status: getResponse2.status, count: getData2.length });

    console.log('\n✅ All tests completed!');

    // Write results to file
    fs.writeFileSync('test-results.json', JSON.stringify(results, null, 2));
    console.log('Results written to test-results.json');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    fs.writeFileSync('test-error.json', JSON.stringify({ error: error.message }, null, 2));
  }
}

testAPI();
