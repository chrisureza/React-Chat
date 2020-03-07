import firebase from "firebase";
import React, { Component } from "react";
import ReactLoading from "react-loading";
import { withRouter } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import { appFirebase, appFirestore } from "../../firebase.config";
import "./Login.scss";
import constants from "../../utils/constants";

class Login extends Component {
  constructor(props) {
    super(props);
    this.provider = new firebase.auth.GoogleAuthProvider();
    this.state = {
      isLoading: true
    };
  }

  componentDidMount() {
    this.checkLogin();
  }

  checkLogin = () => {
    if (localStorage.getItem(constants.ID)) {
      this.setState({ isLoading: false }, () => {
        this.setState({ isLoading: false });
        this.props.showToast(1, "Login success");
        this.props.history.push("/main");
      });
    } else {
      this.setState({ isLoading: false });
    }
  };

  onLoginPress = () => {
    this.setState({ isLoading: true });
    appFirebase
      .auth()
      .signInWithPopup(this.provider)
      .then(async result => {
        let user = result.user;
        if (user) {
          const result = await appFirestore
            .collection(constants.NODE_USERS)
            .where(constants.ID, "==", user.uid)
            .get();

          if (result.docs.length === 0) {
            // Set new data since this is a new user
            appFirestore
              .collection("users")
              .doc(user.uid)
              .set({
                id: user.uid,
                nickname: user.displayName,
                aboutMe: "",
                photoUrl: user.photoURL
              })
              .then(data => {
                // Write user info to local
                localStorage.setItem(constants.ID, user.uid);
                localStorage.setItem(constants.NICKNAME, user.displayName);
                localStorage.setItem(constants.PHOTO_URL, user.photoURL);
                this.setState({ isLoading: false }, () => {
                  this.props.showToast(1, "Login success");
                  this.props.history.push("/main");
                });
              });
          } else {
            // Write user info to local
            localStorage.setItem(constants.ID, result.docs[0].data().id);
            localStorage.setItem(
              constants.NICKNAME,
              result.docs[0].data().nickname
            );
            localStorage.setItem(
              constants.PHOTO_URL,
              result.docs[0].data().photoUrl
            );
            localStorage.setItem(
              constants.ABOUT_ME,
              result.docs[0].data().aboutMe
            );
            this.setState({ isLoading: false }, () => {
              this.props.showToast(1, "Login success");
              this.props.history.push("/main");
            });
          }
        } else {
          this.props.showToast(0, "User info not available");
        }
      })
      .catch(err => {
        this.props.showToast(0, err.message);
        this.setState({ isLoading: false });
      });
  };

  render() {
    return (
      <div className="viewRoot">
        <div className="header">CHAT DEMO</div>
        <button className="btnLogin" type="submit" onClick={this.onLoginPress}>
          SIGN IN WITH GOOGLE
        </button>

        {this.state.isLoading ? (
          <div className="viewLoading">
            <ReactLoading
              type={"spin"}
              color={"#203152"}
              height={"3%"}
              width={"3%"}
            />
          </div>
        ) : null}
      </div>
    );
  }
}

export default withRouter(Login);
