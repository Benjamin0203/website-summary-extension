import React from 'react';
import './App.css';
import { DOMMessage, DOMMessageResponse } from './types';
import { Configuration, OpenAIApi } from "openai"

function App() {
  const API_KEY = process.env.REACT_APP_KEY;
  console.log("check API_KEY: ", API_KEY);

  const configuration = new Configuration({
    apiKey: API_KEY,
  });

  const openai = new OpenAIApi(configuration);


  const [title, setTitle] = React.useState('');
  const [headlines, setHeadlines] = React.useState<string[]>([]);
  const [article, setArticle] = React.useState('');
  const [summary, setSummary] = React.useState('Loading Summary...');


  const chatGPT = async (prompt: string) => {
    prompt = "Write a Summary: " + prompt;
    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
    });
    // console.log(response.data.choices[0].message?.content);
    return (response.data.choices[0].message?.content);

  }

  React.useEffect(() => {
    /**
     * We can't use "chrome.runtime.sendMessage" for sending messages from React.
     * For sending messages from React we need to specify which tab to send it to.
     */
    chrome.tabs && chrome.tabs.query({
      active: true,
      currentWindow: true
    }, tabs => {
      /**
       * Sends a single message to the content script(s) in the specified tab,
       * with an optional callback to run when a response is sent back.
       *
       * The runtime.onMessage event is fired in each content script running
       * in the specified tab for the current extension.
       */
      chrome.tabs.sendMessage(
        tabs[0].id || 0,
        { type: 'GET_DOM' } as DOMMessage,
        (response: DOMMessageResponse) => {
          setTitle(response.title);
          setHeadlines(response.headlines);
          setArticle(response.article.join(''));
          // console.log(response);
          // console.log(response.content.join(''));
          const article = response.article.join('');
          const answer = chatGPT(article);
          answer.then((value: any) => {
            setSummary(value);
          });

        });
    });
  }, []);


  return (
    <div className="App">
      <h1>Webpage Summary!</h1>

      <ul className="SEOForm">
        <li className="SEOValidation">
          <div className="SEOValidationField">
            <span className="SEOValidationFieldTitle">Title</span>
            <span className={`SEOValidationFieldStatus ${title.length < 30 || title.length > 65 ? 'Error' : 'Ok'}`}>
              {title.length} Characters
            </span>
          </div>
          <div className="SEOVAlidationFieldValue">
            {title}
          </div>
        </li>

        {/* <li className="SEOValidation">
          <div className="SEOValidationField">
            <span className="SEOValidationFieldTitle">Main Heading</span>
            <span className={`SEOValidationFieldStatus ${headlines.length !== 1 ? 'Error' : 'Ok'}`}>
              {headlines.length}
            </span>
          </div>
          <div className="SEOVAlidationFieldValue">
            <ul>
              {headlines.map((headline, index) => (<li key={index}>{headline}</li>))}
            </ul>
          </div>
        </li> */}

        {/* <li className="SEOValidation">
          <div className="SEOValidationField">
            <span className="SEOValidationFieldTitle">Content</span>
          </div>
          <div className="SEOVAlidationFieldValue">
            {article}
          </div>
        </li> */}
        <li className="SEOValidation">
          <div className="SEOValidationField">
            <span className="SEOValidationFieldTitle">Summary</span>
            <span className={`SEOValidationFieldStatus ${summary.length < 0 || title.length > 9999 ? 'Error' : 'Ok'}`}>
              {summary.length} Characters
            </span>
          </div>
          <div className="SEOVAlidationFieldValue">
            {summary}
          </div>
        </li>
      </ul>
    </div>
  );
}

export default App;