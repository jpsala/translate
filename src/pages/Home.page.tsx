/* eslint-disable @typescript-eslint/no-explicit-any */
import { TextareaAutosize } from '@mui/base/TextareaAutosize';
import { useEffect, useState } from 'react';
import { Box, Button, Divider } from '@mui/material';
import { useLocation  } from "react-router-dom";
import { useRef } from 'react';
import '../App.css';


let OPENAI_API_KEY = localStorage.getItem('OPENAI_API_KEY');
const ASSISTENT_ID = 'asst_GDwH8D6pX1zmPBLzSSqeXshG';
type ChatMessage = {
    role: string;
    content: string;
}
const HomePage: React.FC = () => {
    const [inputString, setInputString] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [threadId, setThreadId] = useState<string | null>(null);
    const [error, setError] = useState<any>(null);
    // const [currentRun, setCurrentRun] = useState<any>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
    const location = useLocation()
    // const [assistants, setAssistants] = useState<any[]>([]);

    useEffect(() => {
        console.log('location', location)
    }, [location])
    const handleSendRequest = async (text: string) => {
        // createAssistant(`
        //     Role and Goal: Language Mentor is a GPT tailored to refine English and Spanish writing. It specializes in correcting grammar, syntax, and usage in English, and in Spanish, it adopts a conversational style, particularly in the Argentine dialect. The GPT provides corrections only, without comments or clarifications unless requested, ideal for quick and efficient language assistance.
        //     Constraints: Language Mentor refrains from offering explanations or comments unless explicitly asked. Its primary function is text correction, not language instruction.
        //     Guidelines: The GPT corrects grammatical, syntactical, and usage errors in English, while in Spanish, it maintains a conversational tone using everyday expressions. It ensures natural and fluent language in both English and Spanish corrections.
        //     Clarification: Language Mentor asks for clarification only if the original text is unclear or lacks specific instructions.
        //     Personalization: The GPT adopts a formal yet friendly tone, offering corrections with brief explanations when necessary. It also personalizes responses based on user preferences and specific language nuances.
        //     `, `Language Mentor`, [], 'gpt-4'
        // );
        sendMessage(text);
    };
    // async function createAssistant(instructions: string, name: string, tools: any[], model: string): Promise<any> {
    //     const url = 'https://api.openai.com/v1/assistants';
    //     const data = {
    //         instructions,
    //         name,
    //         tools,
    //         model
    //     };
    
    //     const response = await fetch(url, {
    //         method: 'POST',
    //         headers: {
    //             'Content-Type': 'application/json',
    //             'Authorization': `Bearer ${OPENAI_API_KEY}`,
    //             'OpenAI-Beta': 'assistants=v1'
    //         },
    //         body: JSON.stringify(data)
    //     });
    
    //     if (!response.ok) {
    //         throw new Error(`HTTP error! Status: ${response.status}`);
    //     }
    
    //     return await response.json();
    // }

    // async function getAssistants(): Promise<any> {
    //     const url = `https://api.openai.com/v1/assistants?order=desc&limit=20`;
    
    //     const response = await fetch(url, {
    //         method: 'GET',
    //         headers: {
    //             'Content-Type': 'application/json',
    //             'Authorization': `Bearer ${OPENAI_API_KEY}`,
    //             'OpenAI-Beta': 'assistants=v1'
    //         }
    //     });

    //     if (!response.ok) {
    //         throw new Error(`HTTP error! Status: ${response.status}`);
    //     }
    //     const assistants = await response.json();
    //     console.log('Assistants:', assistants?.data);
    //     // setAssistants(assistants);
    //     return ;
    // }


    const getMessages = async (threadId: string) => {
        const messages = (await fetch('https://api.openai.com/v1/threads/' + threadId + '/messages', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`,
                'OpenAI-Beta': 'assistants=v1'
            }
        })
        .then(response => response.json()))?.data
        setChatMessages([])
        const _messages: ChatMessage[] = []
        messages?.forEach((message: any) => {
            _messages.push({role: message.role, content: message.content[0].text.value})
        });
        setChatMessages(_messages)
        setInputString(_messages.length >1 ? _messages[1].content : '')
        return messages
    }

    const getThread = async (threadId: string | undefined) => {
        const url = 'https://api.openai.com/v1/threads/' + threadId; // Replace 'thread_abc123' with your actual thread ID
        
        return fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`,
                'OpenAI-Beta': 'assistants=v1'
            }
        })
        .then(response => response.json())
        .then(data => {
            if(data?.error?.code === 'invalid_api_key'){
                setError(data.error.code)
                console.log('createThread() data %O', data.error.message)
            }
            return data.id
        })
        .catch(() => {
            return undefined
        });
    }    
    const createThread = async (): Promise<string | undefined> => {
        return await fetch('https://api.openai.com/v1/threads', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${OPENAI_API_KEY}`,
                    'OpenAI-Beta': 'assistants=v1'
                },
                body: JSON.stringify({})
            })
            .then(response => response.json())
            .then(data => {
                console.log('createThread() data %O', data)
                return data.id
            })
            .catch(error => {
                console.error('Error code %O, message %O', error.code, error.message);
                return undefined
            });
    }

    const initThread = async (_threadId: string) => {
        setThreadId(_threadId);
        window.localStorage.setItem('threadId', _threadId);
    }

    const initOrCreateThread = async (): Promise<string | undefined> => {
        let threadId = window.localStorage.getItem('threadId') || undefined
        if (threadId) {
            threadId = await getThread(threadId)
        }
        if(!threadId) {
            threadId = await createThread()
            console.log('new threadId %O', threadId)
        }
        threadId && initThread(threadId)
        return threadId
    }

    const createMessage = async (threadId: string | null, text: string) => {

        const data = {
            role: "user",
            content: `${text}`, // Replace with your message text
        };

        return fetch('https://api.openai.com/v1/threads/' + threadId + '/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`,
                'OpenAI-Beta': 'assistants=v1'
            },
            body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(data => {
            return data
        })
        .catch(error => {
            console.error('Error:', error);
        });
    }

    async function getMessageDetails(threadId: string, messageId: string): Promise<any> {
    
        const url: string = `https://api.openai.com/v1/threads/${threadId}/messages/${messageId}`;
    
        try {
            const response: Response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${OPENAI_API_KEY}`,
                    'OpenAI-Beta': 'assistants=v1'
                }
            });
    
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
    
            return await response.json();
        } catch (error) {
            console.error('Error:', error);
            return null;
        }
    }
    
    async function createThreadsRuns(threadId: string): Promise<any> {
        const url: string = `https://api.openai.com/v1/threads/${threadId}/runs`;
    
        const postData: object = {
            assistant_id: ASSISTENT_ID
        };
    
        try {
            const response: Response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${OPENAI_API_KEY}`,
                    'Content-Type': 'application/json',
                    'OpenAI-Beta': 'assistants=v1'
                },
                body: JSON.stringify(postData)
            });
    
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error:', error);
            return null;
        }
    }
    
    async function getThreadsRuns(threadId: string, runId: string): Promise<any> {
        const url: string = `https://api.openai.com/v1/threads/${threadId}/runs/${runId}`;
    
        try {
            const response: Response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${OPENAI_API_KEY}`,
                    'OpenAI-Beta': 'assistants=v1'
                }
            });
    
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
    
            const responseData = await response.json();
            console.log('Run response, assistant_id %O, thread_id %O', responseData.assistant_id, responseData.thread_id);
            return responseData;
        } catch (error) {
            console.error('Error:', error);
            throw new Error("Error: " + error);
        }
    }

    const checkRun = async (threadId: string, runId: any, interval: number = 5000) => {
        return new Promise((resolve, reject) => {
            setLoading(true);
            const intervalHandler = setInterval(() => {
                getThreadsRuns(threadId, runId).then((run) => {
                    if (run?.status === 'completed') {
                        clearInterval(intervalHandler);
                        getMessages(threadId).then((messages) => {
                            console.log('Messages:', messages.length);
                            setLoading(false);
                        })
                        resolve(run);
                    }
                }).catch((error) => {
                    console.error('Error:', error);
                    clearInterval(intervalHandler);
                    setLoading(false);
                    reject(error);
                })
            }, interval);
        })
    }

    const sendMessage = async (text: string) => {
        if(!threadId) {
            return;
        }
        const message = await createMessage(threadId, text)
        getMessageDetails(threadId, message.id)
        const run = await createThreadsRuns(threadId);
        // setCurrentRun(run)
        
        checkRun(threadId, run.id)

    }
    
    useEffect(() => {
        console.log('Home Page')
        if(!OPENAI_API_KEY){
            const prompt = window.prompt('Please enter your OpenAI API key:', '')
            if(prompt) {
                window.localStorage.setItem('OPENAI_API_KEY', prompt);
                OPENAI_API_KEY = prompt
            } else {
                setError('Missing OpenAI API key')
                return
            }
        }
        // getAssistants()
        initOrCreateThread().then((threadId) => {
            threadId && getMessages(threadId);
        })
        inputRef && inputRef.current && inputRef.current.focus();
        const interval = setTimeout(() => {
            inputRef && inputRef.current && inputRef.current.focus();
        }, 1000)
        return () => {
            clearInterval(interval);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <div className="App">
            {error ? (<b>Error: {error}</b>) : null}
            {!error ? (<Box sx={{ display: 'flex', flexDirection: 'row', height: '100vh'}}>
                <Box sx={{ width: '0vw', height: "100vh", display: "flex",flexDirection: "column"}}>
                    {/* {chatMessages && chatMessages.map((message, index) => (
                        <div key={index} style={{ padding: '10px', fontSize: '1.1rem', whiteSpace: 'pre-wrap' }}>
                            {message.role}:<br/>{message.content}
                        </div>
                    ))} */}
                </Box>
                <Box sx={{ width: '100vw', height: "100vh", display: "flex",flexDirection: "column"}}>
                    <TextareaAutosize
                        ref={inputRef}
                        autoFocus
                        disabled={loading}
                        style={{ 
                            flex: .8, resize: "none", fontSize: "1.1Rem", padding: '13px',
                            border: 'none', outline: 'none'}}
                        placeholder="Place your text here"
                        value={inputString}
                        onChange={(e) => setInputString(e.target.value)}
                        onKeyUp={(e) => {
                            if (e.key === 'Enter' && e.ctrlKey) {
                                handleSendRequest(inputString);
                            }
                        }}
                    />
                    <Button 
                        onClick={() => handleSendRequest(inputString)}
                        variant='contained' color='primary'
                        sx={{marginLeft: 'auto', marginTop: '12px', marginBottom: '12px', marginRight: '10px'}}
                    >
                        Send
                    </Button>
                    <Divider/>
                    <Box sx={{ flex: 1, resize: "none", fontSize: "1.1Rem", padding: '5px' }}>

                        {loading ? <div>Loading...</div> :
                        <div style={{ padding: '10px', fontSize: '1.1rem', whiteSpace: 'pre-wrap' }}>
                            {chatMessages.length ? chatMessages[0].content : ''}
                        </div>
                        }
                    </Box>
                </Box>
            </Box>
            ) : null}
        </div>
    );
};

export default HomePage;
