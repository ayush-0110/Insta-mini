import { React, useState, useEffect } from "react";
// import data from "./data";
import "bootstrap/dist/css/bootstrap.css";
import axios from "axios";
import { Navigation, Pagination, Scrollbar, A11y } from "swiper";
import { EffectFlip } from "swiper";
import icon from "../images/heart.svg";
import iconfill from "../images/heart-fill.svg";
import image from "../images/user.svg";
import SuprSendInbox from "@suprsend/react-inbox";
import { Swiper, SwiperSlide } from "swiper/react";
//swiper stylesheets
import "swiper/css";
import "swiper/css/effect-flip";
import "swiper/css/navigation";
import "swiper/css/pagination";
import AddPost from "./addpost";

function Home({ username, email, phone }) {
  const [subid, setsubid] = useState();
  const [showAddPostModal, setShowAddPostModal] = useState(false);
  const [ischecked, setischecked] = useState(true);

  const [posts, setPosts] = useState([]);

  const setUserPref = async () => {
    try {
      const newischecked = !ischecked;
      setischecked(!ischecked);
      const response = await axios.post(
        "https://multiii.onrender.com/userpref",
        {
          ischecked: newischecked,
        }
      );
      console.log(response.data);
      console.log("for frontend,notifs are: ", newischecked);
    } catch (error) {
      console.log(error);
    }
  };
  const fetchPosts = async () => {
    try {
      const response = await axios.get("https://multiii.onrender.com/posts");
      const updatedPosts = response.data.map((post) => ({
        ...post,
        isLiked: false,
      }));
      setPosts(updatedPosts);
    } catch (error) {
      console.error("An error occurred while fetching posts:", error);
    }
  };
  useEffect(() => {
    fetchPosts();
  }, []);

  useEffect(() => {
    const getSub = async () => {
      const response = await axios.get("https://multiii.onrender.com/subid", {
        params: {
          email: email,
        },
      });
      console.log(response);
      return response;
    };

    getSub()
      .then((data) => {
        if (ischecked === true) setsubid(data.data);
      })
      .catch((e) => {
        console.log(e);
      });
  }, [email]);

  return (
    <>
      {showAddPostModal && (
        <AddPost
          showAddPostModal={showAddPostModal}
          setShowAddPostModal={setShowAddPostModal}
          fetchPosts={fetchPosts}
        />
      )}
      <div style={{ width: "100vw", height: "100vh" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "#222",
            color: "#fff",
            width: "100%",
            marginBottom: "70px",
            padding: "20px 10px",
            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
          }}
        >
          <div
            style={{
              position: "fixed",
              left: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
              <div style={{fontWeight:'bold', fontSize:'18px'}}> Enable Notifications? &nbsp;</div>
            <div className="form-check form-switch" style={{height:'25px', width:'65px'}}>
              <input
                className="form-check-input"
                type="checkbox"
             style={{width:'40px',height:'19px'}}
                role="switch"
                id="flexSwitchCheckChecked"
                checked={ischecked}
                onClick={() => {
                  setUserPref();
                }}
              />
            </div>
          </div>
          <h2 style={{ fontSize: "35px" }}>Insta-Kilo-Gram</h2>
          <div
            style={{
              position: "fixed",
              right: "10px",
              display: "flex",
              alignItems: "center",
            }}
          >
            <div>
              <button
                className="button1"
                onClick={() => setShowAddPostModal(true)}
                style={{ marginRight: "15px" }}
              >
                NewPost
              </button>
            </div>

            <SuprSendInbox
              theme={{
                bell: { color: "white" },
              }}
              workspaceKey="Wct0hLNKo5NXA05QiOdU"
              workspaceSecret="Y2XOv3V0pXRbioyiWH7u"
              subscriberId={subid}
              distinctId={email}
            />
            {console.log(`${subid}+${email}`)}
          </div>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            padding: "10px",
          }}
        >
          <div style={{ width: "20%" }}>
            <Swiper
              modules={[Navigation, Pagination, Scrollbar, A11y, EffectFlip]}
              effect={"flip"}
              //   navigation={true}
              pagination={{ clickable: true }}
            >
              {posts.map((item, index) => (
                <SwiperSlide
                  key={index}
                  style={{
                    borderRadius: "12px",
                    border: "1px solid grey",
                    height: "65vh",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    backgroundColor: "white",
                  }}
                >
                  <div
                    className="head1"
                    style={{
                      display: "flex",
                      margin: "10px",
                      marginLeft: "30px",
                      fontSize: "18px",
                      alignItems: "center",
                      width: "100%",
                    }}
                  >
                    <img
                      style={{
                        marginRight: "7px",
                        cursor: "pointer",
                        borderRadius: "50%",
                        width: "25px",
                        height: "25px",
                      }}
                      src={image}
                      alt={item.contributor}
                      title={item.contributor}
                    />
                    {item.contributor}
                  </div>
                  <div
                    className="image1"
                    style={{
                      width: "100%",
                      height: "45%",
                      borderTop: "2px solid #80808052",
                      borderBottom: "2px solid #80808052",
                    }}
                  >
                    <img
                      src={`https://multiii.onrender.com/images/${item.image}`}
                      alt="image1"
                      style={{
                        objectFit: "cover",
                        height: "100%",
                        width: "100%",
                      }}
                    />
                  </div>
                  <div
                    className="action-center"
                    style={{
                      fontSize: "18px",
                      width: "100%",
                      margin: "10px",
                      marginLeft: "30px",
                    }}
                  >
                    <img
                      src={posts[index].isLiked ? iconfill : icon}
                      alt="like"
                      style={{
                        cursor: "pointer",
                        height: "20px",
                        width: "20px",
                      }}
                      onClick={async () => {
                        const newPosts = [...posts];
                        newPosts[index].isLiked = !newPosts[index].isLiked;

                        if (newPosts[index].isLiked) {
                          try {
                            await axios.post(
                              `https://multiii.onrender.com/posts/${posts[index]._id}/like`,
                              {
                                userId: email,
                              }
                            );
                          } catch (error) {
                            console.error(
                              "An error occurred while liking the post:",
                              error
                            );
                          }
                        }
                        setPosts(newPosts);
                      }}
                    />
                  </div>
                  <div
                    className="body1"
                    style={{
                      width: "95%",
                      height: "33%",
                      margin: "0 10px",
                      overflowY: "auto",
                      marginBottom: "20px",
                    }}
                  >
                    <span>
                      <strong>{item.contributor} : &nbsp; </strong>
                    </span>
                    {item.body}
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      </div>
    </>
  );
}

export default Home;
