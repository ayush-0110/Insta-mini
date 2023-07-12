import { React, useState, useRef, useEffect } from "react";
import axios from "axios";

function AddPost({ setShowAddPostModal, fetchPosts }) {
  const cardRef = useRef(null);
  const [contributor, setContributor] = useState("");
  const [email, setEmail] = useState("");
const [imageFile, setImageFile] = useState(null);
  const [body, setBody] = useState("");

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (cardRef.current && !cardRef.current.contains(event.target)) {
        setShowAddPostModal(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [setShowAddPostModal]);


  const handleImageChange = (event) => {
    const file = event.target.files[0];
    setImageFile(file);
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();

    try {
        const formData = new FormData();
      formData.append("contributor", contributor);
      formData.append("uploaded_file", imageFile);
      formData.append("body", body);
      formData.append("userId", email);
      const response = await axios.post("https://multiii.onrender.com/posts", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      console.log("New post added:", response.data);
      setShowAddPostModal(false);
      setContributor("");
      setImageFile(null);
      setBody("");
      fetchPosts()
    } catch (error) {
        console.error("An error occurred while adding a new post:", error);
    }
};

return (
    <>
        <div
        style={{
            display: "flex",
            position: "absolute",
            top: "0",
            left: "0",
            right: "0",
            bottom: "0",
            zIndex: "5",
            backgroundColor: "rgba(39, 39, 39, 0.33)",
            alignItems: "center",
            justifyContent: "center",
        }}
        >
          <div
            ref={cardRef}
            style={{
              display: "flex",
              height: "50%",
              width: "50%",
              //   background: "white",
              background: "#FFFFFF",
              borderRadius: "12px",
              //   boxShadow: "inset 0 0 10px rgba(0, 0, 0, 0.2)",
              boxShadow: "0 0 20px rgba(0, 0, 0, 0.2)",
            }}
          >
            <form
            encType="multipart/form-data"
              onSubmit={handleFormSubmit}
              style={{
                width: "100%",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",

                justifyContent: "center",
              }}
            >
              <input
                type="text"
                className="input"
                value={contributor}
                onChange={(event) => setContributor(event.target.value)}
                placeholder="Contributor"
                required
              />
              <input
                type="email"
                className="input"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Email"
                required
              />
              <textarea
                className="input"
                style={{ resize: "none" }}
                value={body}
                onChange={(event) => setBody(event.target.value)}
                placeholder="Body"
                required
              ></textarea>
              <input
                // className="input"
                type="file"
                accept="image/*"
                name="uploaded_file"
                onChange={handleImageChange}
                style={{margin:'10px 0'}}
                required
              />
              <button
                className="button1"
                type="submit"
                style={{ marginTop: "10px" }}
              >
                Add Post
              </button>
            </form>
          </div>
        </div>
    </>
  );
}

export default AddPost;
