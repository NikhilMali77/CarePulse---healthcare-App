// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import "./symptom.css"; // Import the CSS file

// const SymptomChecker = () => {
//   const [symptoms, setSymptoms] = useState("");
//   const [prediction, setPrediction] = useState(null);

//   const checkSymptoms = async () => {
//     try {
//       const { data } = await axios.post("http://localhost:5000/check-symptoms", { symptoms });
//       console.log("API Response:", data); // Debugging
//       setPrediction(data.results);
//     } catch (error) {
//       console.error("Error:", error);
//     }
//   };

//   return (
//     <div className="container">
//       <h2>AI Symptom Checker 🤖</h2>
//       <textarea
//         placeholder="Enter your symptoms..."
//         value={symptoms}
//         onChange={(e) => setSymptoms(e.target.value)}
//       />
//       <button onClick={checkSymptoms}>Check Symptoms</button>

//       {/* Display Predictions */}
//       {prediction && prediction.length > 0 ? (
//         <div>
//           <h3>Possible Conditions:</h3>
//           <ul>
//             {prediction.map((item, index) => (
//               <li key={index}>
//                 <strong>{item.name}</strong> - {item.probability}
//               </li>
//             ))}
//           </ul>
//         </div>
//       ) : (
//         <p>🤔 No results yet. Enter symptoms and click the button.</p>
//       )}
//     </div>
//   );
// };

// export default SymptomChecker;

import React, { useState } from "react";
import axios from "axios";
import "./symptom.css"; // Import the CSS file

const SymptomChecker = () => {
  const [symptoms, setSymptoms] = useState("");
  const [prediction, setPrediction] = useState(null);
  const apiKey = "AIzaSyDFJWym_7BtF0ey_A7H48twbNbMGeay5Ow";

  const checkSymptoms = async () => {
    if (!apiKey || apiKey === "YOUR_GEMINI_API_KEY") {
      alert("Please replace 'YOUR_GEMINI_API_KEY' with your actual Gemini API key.");
      return;
    }

    const prompt = `Given the following symptoms(Prompt): "${symptoms}",
    please provide a JSON object containing three possible related diseases.
    The object should have the format:
    {
      "possible_disease1": "disease name 1",
      "possible_disease2": "disease name 2",
      "possible_disease3": "disease name 3"
    }
    Only return the JSON object and nothing else. Also if prompt consists of anything else than symptom context please respond with a object with this string {"message": "Please provide a relevant prompt describing your symptoms."}`;

    try {
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
        {
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
        }
      );
      console.log(prompt);
      console.log("API Raw Response:", response.data?.candidates?.[0]?.content?.parts?.[0]?.text); // Log the raw text

      const rawTextResponse = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (rawTextResponse) {
        // Remove potential Markdown code block wrappers
        const cleanedResponse = rawTextResponse.trim();
        const jsonStartIndex = cleanedResponse.indexOf('{');
        const jsonEndIndex = cleanedResponse.lastIndexOf('}');

        if (jsonStartIndex !== -1 && jsonEndIndex !== -1 && jsonStartIndex < jsonEndIndex) {
          const jsonString = cleanedResponse.substring(jsonStartIndex, jsonEndIndex + 1);
          try {
            const parsedResponse = JSON.parse(jsonString);
            console.log("parsed", parsedResponse);
            if (parsedResponse && parsedResponse.message) {
              setPrediction({ message: parsedResponse.message });
            } else if (
              parsedResponse &&
              parsedResponse.possible_disease1 &&
              parsedResponse.possible_disease2 &&
              parsedResponse.possible_disease3
            ) {
              setPrediction({
                results: [
                  { name: parsedResponse.possible_disease1 },
                  { name: parsedResponse.possible_disease2 },
                  { name: parsedResponse.possible_disease3 },
                ],
              });
            } else {
              setPrediction({ message: "Unexpected response format from the AI." });
            }
          } catch (parseError) {
            console.error("Error parsing JSON:", parseError);
            setPrediction({ message: "Error processing the AI response (invalid JSON)." });
          }
        } else {
          console.error("Could not find valid JSON boundaries in the response.");
          setPrediction({ message: "Error processing the AI response (invalid format)." });
        }
      } else {
        setPrediction({ message: "Empty or unexpected content in the AI response." });
      }
    } catch (error) {
      console.error("Error calling Gemini API:", error);
      setPrediction({ message: "Failed to communicate with the AI." });
    }
  };

  return (
    <div className="container">
      <h2>AI Symptom Checker 🤖</h2>
      <textarea
        placeholder="Enter your symptoms..."
        value={symptoms}
        onChange={(e) => setSymptoms(e.target.value)}
      />
      <button onClick={checkSymptoms}>Check Symptoms</button>

      {/* Display Predictions */}
      {prediction && prediction.message ? (
        <p className="error-message">{prediction.message}</p>
      ) : prediction && prediction.results && prediction.results.length > 0 ? (
        <div>
          <h3>Possible Conditions:</h3>
          <ul>
            {prediction.results.map((item, index) => (
              <li key={index}>
                <strong>{item.name}</strong>
              </li>
            ))}
          </ul>
          <p className="disclaimer">
            This is an AI-powered suggestion and should not be considered a medical diagnosis. Please consult a healthcare professional for any health concerns.
          </p>
        </div>
      ) : (
        <p>🤔 No results yet. Enter symptoms and click the button.</p>
      )}
    </div>
  );
};

export default SymptomChecker;