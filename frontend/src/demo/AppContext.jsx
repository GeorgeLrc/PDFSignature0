import axios from "axios"
import { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";

export const AppContext = createContext();


export const AppContextProvider = ({children}) => {

    axios.defaults.withCredentials = true;
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    const [isLoggedIn ,setIsLoggedIn] = useState(false);
    const [userData, setUserData] = useState(false);
    const [templatesByCurrentUser,setTemplatesByCurrentUser] = useState([]);
    const [templateById,setTemplateById] = useState("");
    const [otherUsers,setOtherUsers] = useState([]);
    const [myRequests, setMyRequests] = useState([]);
    const [requestsByOthers,setRequestsByOthers] = useState([]);
    const [publicTemplates,setPublicTemplates] = useState([]);
    const [requestById,setRequestById] = useState("");
    const [requests,setRequests] = useState([]);
    const [recentTemplates,setRecentTemplates] = useState([]);

    const [signature,setSignature] = useState(localStorage.getItem("savedSignature") ? localStorage.getItem("savedSignature") : null)


    const getAuthState = async () => {
        try {
            const {data} = await axios.get(backendUrl+"/api/auth/is-auth");
            if(data.success){
                setIsLoggedIn(true);
                getUserData();
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    const getUserData = async () => {
        try {
            const {data} = await axios.get(backendUrl + '/api/auth/user-data');
            console.log("userdata from context");
            console.log(data)
            data.success ? setUserData(data.userData) : toast.error(data.message)
        } catch (error) {
            toast.error(error.message)
        }
    }

    const getTemplatesByCurrentUser = async () => {
        try {
            const {data} = await axios.get(backendUrl+"/api/auth/templates");
            console.log(data)
            if(data.success){
                setTemplatesByCurrentUser(data.templates)
            }else{
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    const getTemplateById = async (templateId) => {
        try {
            const {data} = await axios.get(backendUrl+`/api/auth/templates/${templateId}`);
            if(data.success){
                setTemplateById(data.template);
                // updateLastOpendTime(data.template._id);

            }else{
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    const getOtherUsersList = async () => {
        try {
            const {data} = await axios.get(backendUrl+"/api/auth/users");
            if(data.success){
                setOtherUsers(data.users);
            }else{
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    const getMyRequests = async () => {
        try {
            const {data} = await axios.get(backendUrl+"/api/auth/my-requests");
            if(data.success){
                setMyRequests(data.requests);
            }else{
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    const getRequestsByOthers = async () => {
        try {
            const {data} = await axios.get(backendUrl+"/api/auth/requests-by-others");
            if(data.success){
                setRequestsByOthers(data.requests);
            }else{
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    // Fetch all requests and return those where current user is a recipient (signed or not)
    const getRequestsByOthersAll = async () => {
        try {
            const {data} = await axios.get(backendUrl+"/api/auth/requests");
            if(data.success){
                const all = data.requests || [];
                const filtered = all.filter((req) => Array.isArray(req.recipients) && req.recipients.some(r => {
                    const rid = r.userId && (r.userId._id || r.userId) ? (r.userId._id ? String(r.userId._id) : String(r.userId)) : null;
                    return rid && userData && String(userData._id) === String(rid);
                }));
                setRequestsByOthers(filtered);
            }else{
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    const getPublicTemplates =  async () => {
        try {
            const {data} = await axios.get(backendUrl+"/api/auth/public-templates");
            console.log(data)
            if(data.success){
                setPublicTemplates(data.templates)
            }else{
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    const getRequestById = async (requestId) => {
        try {
            const {data} = await axios.get(backendUrl+`/api/auth/requests/${requestId}`);
            console.log(data)
            if(data.success){
                setRequestById(data.request);
            }else{
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    const getRequests = async () => {
        try {
            const {data} = await axios.get(backendUrl+"/api/auth/requests");
            console.log(data)
            if(data.success){
                setRequests(data.requests);
            }else{
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    const getRecentTemplatesByCurrentUser = async () => {
        try {
            const {data} = await axios.get(backendUrl+"/api/auth/recent-templates")
            if(data.success){
                setRecentTemplates(data.recentTemplates)
            }else{
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }


    useEffect(()=>{
        getAuthState()
    },[])

    const value = {
        backendUrl,
        isLoggedIn,setIsLoggedIn,
        userData,setUserData,
        getUserData,
        templatesByCurrentUser,getTemplatesByCurrentUser,
        templateById,getTemplateById,
        otherUsers,getOtherUsersList,
    myRequests,getMyRequests,
    requestsByOthers,getRequestsByOthers,
    getRequestsByOthersAll,
        publicTemplates,getPublicTemplates,
        signature,setSignature,
        requestById,getRequestById,
        requests,getRequests,
        recentTemplates,getRecentTemplatesByCurrentUser,
    }

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    )
}