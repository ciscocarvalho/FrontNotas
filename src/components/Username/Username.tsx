import { useRef, useState } from "react";
import "./Username.scss"
import right from "../../assents/marca-de-verificacao.png"
import exit from "../../assents/Vector (1).png"
import { useUsernameContext } from "../../context/UsernameContext";
import { useInitialRender } from "../../hooks/useInitialRender";

export default function Username (){
    const { username, setUsername } = useUsernameContext();
    const inputRef = useRef<HTMLInputElement>(null);
    const [editing, setEditing] = useState(false);
    const isInitialRender = useInitialRender();

    const confirm = () => {
        if (inputRef.current?.value) {
            setUsername(inputRef.current.value);
        }

        setEditing(false);
    };

    const cancel = () => {
        if (inputRef.current?.value) {
            inputRef.current.value = username;
        }

        setEditing(false);
    };

    return (
        <div className="username-container">
            <div className="username">
                <p>Nome de usuário:</p>
                <input
                    ref={inputRef}
                    type="text"
                    value={isInitialRender ? username : undefined}
                    onFocus={() => setEditing(true)}
                    onBlur={cancel}
                />
                {
                    !editing
                        ? null
                        : (
                            <div className="confirmOptionCreatePost">
                                <img
                                    src={right}
                                    alt="certo"
                                    className="rightConfirmOptionCreatePost"
                                    onClick={confirm}
                                />
                                <img
                                    src={exit}
                                    alt="x"
                                    className="exitConfirmOptionCreatePost"
                                    onClick={cancel}
                                />
                            </div>
                        )
                }
            </div>
        </div>
    );
}
