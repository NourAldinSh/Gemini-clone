import { createContext, useState } from "react";
import run from "../config/gemini";

export const Context = createContext();

const ContextProvider = ({ children }) => {
  const [input, setInput] = useState("");
  const [recentPrompt, setRecentPrompt] = useState("");
  const [prevPrompts, setPrevPrompts] = useState([]);
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resultData, setResultData] = useState("");

  const newChat = () => {
    setLoading(false);
    setShowResult(false);
  };

  const delayPara = (index, nextWord) => {
    setTimeout(() => {
      setResultData((prev) => prev + nextWord);
    }, 10 * index);
  };

  const onSent = async (prompt) => {
    setResultData("");
    setLoading(true);
    setShowResult(true);

    let response;

    if (prompt !== undefined) {
      response = await run(prompt);
      setRecentPrompt(prompt);
    } else {
      setPrevPrompts((prev) => [...prev, input]);
      setRecentPrompt(input);
      response = await run(input);
    }

    try {
      let responseParts = response.split("**");
      let formattedResponse = "";
      for (let i = 0; i < responseParts.length; i++) {
        if (i === 0 || i % 2 !== 1) {
          formattedResponse += responseParts[i];
        } else {
          formattedResponse += "<b>" + responseParts[i] + "</b>";
        }
      }
      let formattedResponseWithLineBreaks = formattedResponse.split("*").join("</br>");
      let wordsArray = formattedResponseWithLineBreaks.split(" ");
      for (let i = 0; i < wordsArray.length; i++) {
        const nextWord = wordsArray[i];
        delayPara(i, nextWord + " ");
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
      setInput("");
    }
  };

  const contextValue = {
    input,
    setInput,
    recentPrompt,
    setRecentPrompt,
    prevPrompts,
    setPrevPrompts,
    showResult,
    loading,
    resultData,
    onSent,
    newChat,
  };

  return <Context.Provider value={contextValue}>{children}</Context.Provider>;
};

export default ContextProvider;
