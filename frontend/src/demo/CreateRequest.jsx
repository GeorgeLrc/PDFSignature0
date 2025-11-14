import React, { useContext, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
// import { AppContext } from "../context-api/AppContext";
import { toast } from "react-toastify";
import axios from "axios";
import PlaceSign from "./PlaceSign";
import Modal from "react-modal";
import api from "@/utils/api";
import useAuth from '@/hooks/useAuth'

export default function CreateRequest() {
  const location = useLocation();
  const templateId = location.state?.templateId;
  const filePath = location.state?.filePath;
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const templateFileUrl = backendUrl && filePath ? `${backendUrl}/files/${filePath}` : null;

  const navigate = useNavigate();
  const { accessToken } = useAuth();
  const [otherUsers, setOtherUsers] = useState([]);

  // const { backendUrl, otherUsers, getOtherUsersList } = useContext(AppContext);



  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [title, setTitle] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [recipients, setRecipients] = useState([]);

  const [currentRecipient, setCurrentRecipient] = useState(null);

  const [isPlaceSignModalOpen, setIsPlaceSignModalOpen] = useState(false);
  const [signaturesForRecipient, setSignaturesForRecipient] = useState([]);

  const getOtherUserList = async (token) => {
    try {
        let { data } = await api.get('/api/auth/users', {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${token}`,
            },
          });

        if(data.success) {
            console.log(data);
            setOtherUsers(data.users);
        }
        
            
      } catch (error) {
          console.log(error);
          toast.error(error);
      }
  }

  useEffect(() => {
    getOtherUserList(accessToken);
  }, [accessToken]);

  useEffect(() => {
    // Filter users based on search term
    if (searchTerm) {
      const filtered = otherUsers.filter((user) =>
        `${user.first_name} ${user.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers([]);
    }
  }, [searchTerm, otherUsers]);

  // Add recipient when a user is clicked
  const addRecipient = (user) => {
    if (!recipients.some((r) => r._id === user._id)) {
      setRecipients([...recipients, user]);
    }
    setSearchTerm(""); // Clear search input after selecting
  };

  const closeModalAndAddSignatureToTheRecipient = () => {
    //close the modal
    setIsPlaceSignModalOpen(false);
    console.log(currentRecipient)

    //add the signatures to the current recipient
    setRecipients((prevRecipients) =>
      prevRecipients.map((recipient) => {

        console.log(recipient._id)
        return recipient._id === currentRecipient._id
          ? { ...recipient, signaturePositions: signaturesForRecipient }
          : recipient
      })
    );
    console.log("signatures for current recipient")
    console.log(signaturesForRecipient)

    //clear the signatures place
    setSignaturesForRecipient([]);

    console.log("recipients")
    console.log(recipients)

  }

  // Remove recipient from the list
  const removeRecipient = (id) => {
    setRecipients(recipients.filter((user) => user._id !== id));
  };

  const createNewRequest = async () => {
    try {

      if (!recipients.length || !subject || !message || !title) {
        toast.error("Please fill in all fields before submitting.");
        return;
      }


      const formattedRecipients = recipients.map((user) => ({
        userId: user._id,
        signed: false,
        signaturePositions: user.signaturePositions || [],
      }));

      console.log("formt",formattedRecipients)

      let { data } = await api.post('/api/auth/create-request',{
        recipients: formattedRecipients,
        emailSubject: subject,
        emailMessage: message,
        templateId,
        title
      }, {
        headers: {
          
          Authorization: `Bearer ${accessToken}`,
        },
      });
      console.log(data);
      console.log("this run");

      // const { data } = await axios.post("http://localhost:5001/api/auth/create-request", {
      //   recipients: formattedRecipients,
      //   emailSubject: subject,
      //   emailMessage: message,
      //   templateId,
      //   title
      // },{
      //   headers: {
      //     "Content-Type": "multipart/form-data",
      //     Authorization: `Bearer ${accessToken}`,
      //   },
      // })

      if (data.success) {
        toast.success(data.message)
        navigate("/requests")
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  return (
    <div className="p-4">
      <h2 className="mb-6 text-2xl font-semibold">Create Request</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <section className="md:col-span-2 space-y-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-medium mb-2">Recipients</h3>
            <div className="flex gap-2">
              <input
                type="text"
                className="flex-1 p-2 border rounded focus:ring-1 focus:ring-blue-300"
                placeholder="Search users by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <div className="px-3 py-2 text-sm text-gray-600 bg-gray-50 rounded">Template: {templateId || '—'}</div>
            </div>

            {/* Search Results */}
            {filteredUsers && filteredUsers.length > 0 && (
              <div className="mt-3 border rounded shadow-sm max-h-44 overflow-auto">
                {filteredUsers.map((user) => (
                  <div
                    key={user._id}
                    className="flex items-center justify-between p-2 cursor-pointer hover:bg-gray-100"
                    onClick={() => addRecipient(user)}
                  >
                    <div>
                      <div className="font-medium">{user.first_name} {user.last_name}</div>
                      <div className="text-xs text-gray-500">{user.email}</div>
                    </div>
                    <button className="text-sm text-blue-600">Add</button>
                  </div>
                ))}
              </div>
            )}

            {/* Selected Recipients */}
            {recipients.length > 0 && (
              <div className="mt-4">
                <h4 className="font-semibold mb-2">Selected Recipients</h4>
                <div className="flex flex-wrap gap-2">
                  {recipients.map((user) => (
                    <div key={user._id} className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full">
                      <span className="text-sm">{user.first_name} {user.last_name}</span>
                      <button
                        className="text-xs px-2 py-1 bg-blue-600 text-white rounded"
                        onClick={() => {
                          setCurrentRecipient(user)
                          setIsPlaceSignModalOpen(true);
                        }}
                      >
                        Place sign
                      </button>
                      <button
                        className="text-xs text-red-600"
                        onClick={() => removeRecipient(user._id)}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="bg-white p-4 rounded-lg shadow space-y-3">
            <label className="block text-sm font-medium">Title</label>
            <input
              type="text"
              className="w-full p-2 border rounded focus:ring-1 focus:ring-blue-300"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <label className="block text-sm font-medium">Email Subject</label>
            <input
              type="text"
              className="w-full p-2 border rounded focus:ring-1 focus:ring-blue-300"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />

            <label className="block text-sm font-medium">Email Message</label>
            <textarea
              className="w-full p-2 border rounded focus:ring-1 focus:ring-blue-300"
              rows="5"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />

            <div className="flex justify-end">
              <button
                onClick={createNewRequest}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md shadow-sm"
              >
                Create Request
              </button>
            </div>
          </div>
        </section>

        <aside className="space-y-4">
          <div className="bg-white p-4 rounded-lg shadow text-center">
            <h4 className="font-semibold">Template Preview</h4>
            <div className="mt-3">
              {backendUrl && filePath ? (
                <iframe
                  src={templateFileUrl}
                  width="100%"
                  height="300px"
                  style={{ border: "none" }}
                  title="Template preview"
                />
              ) : (
                <p className="text-sm text-gray-500">Template preview unavailable.</p>
              )}
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow">
            <h4 className="font-semibold mb-2">Actions</h4>
            <button
              onClick={() => setIsPlaceSignModalOpen(true)}
              className="w-full px-3 py-2 bg-blue-600 text-white rounded-md"
            >
              Place Sign (Preview)
            </button>
            <button
              onClick={() => navigate(-1)}
              className="w-full mt-2 px-3 py-2 bg-gray-100 rounded-md"
            >
              Back
            </button>
          </div>
        </aside>
      </div>

      {/* Modal for place signature */}
      <Modal
        isOpen={isPlaceSignModalOpen}
        onRequestClose={closeModalAndAddSignatureToTheRecipient}
        contentLabel="Place Signature"
        className="p-5 mt-20 bg-white rounded-lg shadow-lg max-w-4xl mx-auto"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
      >
        <h2 className="text-xl font-bold">Place Signature</h2>
        {templateFileUrl ? (
          <PlaceSign
            pdfFile={templateFileUrl}
            setSignatures={setSignaturesForRecipient}
            signatures={signaturesForRecipient}
          />
        ) : (
          <p className="text-sm text-red-600">Cannot place signatures because the template file is unavailable.</p>
        )}
        <div className="mt-4 flex justify-end">
          <button onClick={closeModalAndAddSignatureToTheRecipient} className="px-4 py-2 bg-blue-600 text-white rounded-md">Save</button>
        </div>
      </Modal>
    </div>
  );
}
