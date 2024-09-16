import { app } from "../cloud/firebase";
import { getAuth } from "firebase/auth"
import { useAuthState } from "react-firebase-hooks/auth"
import { createUserWithEmailAndPassword } from "firebase/auth";
import { useState } from "react";
import Train from "./Train";

const signIn = async () => {
    await createUserWithEmailAndPassword(auth, email, password);
};

const MailAuth = (setCurrentView) => {
    const auth = getAuth(app);
    const [user, loading, error] = useAuthState(auth);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    if (loading) {
        return (
            <div>
                <p>Initialising User...</p>
            </div>
        );
    }
    if (error) {
        return (
            <div>
                <p>Error: {error}</p>
            </div>
        );
    }
    if (user) {
        return (
            <Train setCurrentView={setCurrentView} />
        );
    }
    return (
        <div>
            <form>
                <input
                    type="text"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <button onClick={signIn}>Sign in</button>
            </form>
        </div>
    );

}

export default MailAuth;