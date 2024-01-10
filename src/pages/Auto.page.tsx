/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import { Box } from '@mui/material';
import { useSearchParams  } from "react-router-dom";
import '../App.css';


let OPENAI_API_KEY = localStorage.getItem('OPENAI_API_KEY');
const ASSISTENT_ID = 'asst_Mg3X25EdbfOMFDDVOflKFeWz';

const AutoPage: React.FC = () => {
    const [loading, setLoading] = useState<boolean>(false);
    const [threadId, setThreadId] = useState<string | null>(null);
    const [error, setError] = useState<any>(null);
    // const [currentRun, setCurrentRun] = useState<any>(null);
    const [searchParams] = useSearchParams();
    const [ready, setReady] = useState<boolean>(false)
    const [response, setResponse] = useState<any>(null);
    // const [assistants, setAssistants] = useState<any[]>([]);


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
        let threadId = window.localStorage.getItem('threadIdForAutoTranslation') || undefined
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
                            console.log('Messages:', messages);
                            messages.forEach((message: { role: string; content: Array<{ text: { value: string } }>; }) => {
                                if(message.role === 'assistant') {
                                    let msg = ''
                                    if(message.content.length){
                                        msg += message.content[0].text.value
                                    }
                                    setResponse(msg);
                                }
                            })
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

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const sendMessage = async (text: string) => {
        if(!threadId) {
            return;
        }
        setLoading(true)
        try {
            const message = await createMessage(threadId, text)
            getMessageDetails(threadId, message.id)
            const run = await createThreadsRuns(threadId);
            // setCurrentRun(run)
            checkRun(threadId, run.id)
        } catch (error) {
            console.log('Error:', error);
        } finally {
         setReady(true)   
        }

    }
    

    useEffect(() => {
        console.log('Starting...')
        setLoading(true)
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
            console.log('threadId', threadId)
            threadId && getMessages(threadId);
            setReady(true)
            console.log('Ready', threadId)
            sendMessage(searchParams.get('text') || 'test')
        })
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <div className="App">
            {error ? (<b>Error: {error}</b>) : null}
            {!error ? (<Box sx={{ display: 'flex', flexDirection: 'row', height: '100vh'}}>
                <Box sx={{ width: '100vw', height: "100vh", display: "flex",flexDirection: "column"}}>
                    <Box sx={{ flex: 1, resize: "none", fontSize: "1.1Rem", padding: '5px' }}>
                        {loading ? <div>Loading...</div> :
                        <div style={{ padding: '10px', fontSize: '1.1rem', whiteSpace: 'pre-wrap' }}>
                            {response}
                        </div>
                        }
                    </Box>
                </Box>
            </Box>
            ) : null}
        </div>
    );
};

export default AutoPage;
