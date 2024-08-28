const express = require('express');
const app = express();
const axios = require('axios');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

app.use(express.static(path.join(__dirname, 'public')));  // Make sure the CSS and JS files are in the 'public' directory

app.use(cors());//allows requests from different ports

app.use(express.json());//parses the js json format to js object

app.get('/', (req, res) => {
   const filePath="./index.html";
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading the HTML file:', err);
            res.status(500).send('Internal Server Error');
            return;
        }
        res.send(data);
    });
});

app.post('/analyze-case', async (req, res) => {
   // console.log(req)
    const { caseDetails } = req.body;
    //console.log(caseDetails);
    try {
        // Call Groq API with the case details
        const groqResponse = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
            //payload
            model: 'llama3-8b-8192',  
            messages: [
                { role: 'system', content: 'You are a legal assistant.' },
                { role: 'user', content: `Here are the details of a crime: ${caseDetails}. Please provide a detailed summary of the case and identify the applicable legal sections with references.` }//prompt
            ],
            max_tokens: 500, //limits the length of response 
            temperature: 0.7  //unit of randomness//lower value = focused + deterministic output //higher value= creative + varied output
        }, {
            //haeders(additional info)
            headers: {
                'Authorization': `Bearer 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`  //This header is used to authenticate the request. The Groq API requires an API key (provided after Bearer) to verify that the request is coming from an authorized user
            }
        });
        
        //console.log(groqResponse.data.choices)

        // Extract the generated response text from the choices array
        const responseText = groqResponse.data.choices[0].message.content;
        //console.log(responseText);
       //mostly the response text is structured like "Summary: <summary> Sections: <sections>"
       const summaryMatch = responseText.match(/Summary:\s*(.*?)(?=Sections:|$)/s);//This match method applies the regular expression to the responseText string and returns an array of matches or null if no match is found.
       //summaryMatch will be an array where:
            //   summaryMatch[0] contains the entire matched string including "Summary:" and the text following it up to "Sections:" or the end of the string.
            //   summaryMatch[1] contains only the captured summary text, excluding "Summary:" and any whitespace.
       const sectionsMatch = responseText.match(/Sections:\s*(.*)/s);

       const summary = summaryMatch ? summaryMatch[1].trim() : 'No summary provided';
       const sections = sectionsMatch ? sectionsMatch[1].trim() : 'No sections provided';

       // Return the separated summary and sections
       res.json({ summary, sections });
    } catch (error) {
        console.error('Error in /analyze-case:', error);
        res.status(500).json({ error: 'Error analyzing the case' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
