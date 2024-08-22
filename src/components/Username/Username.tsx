import { useRef, useState } from "react";
import "./Username.scss"
import right from "../../assents/marca-de-verificacao.png"
import exit from "../../assents/Vector (1).png"
import { useUsernameContext } from "../../context/UsernameContext";
import { useInitialRender } from "../../hooks/useInitialRender";

export default function Username (){
    const { username, setUsername } = useUsernameContext();
    const inputRef = useRef<HTMLInputElement>(null);
    const confirmRef = useRef<HTMLImageElement>(null);
    const cancelRef = useRef<HTMLImageElement>(null);
    const [editing, setEditing] = useState(false);
    const isInitialRender = useInitialRender();

    const confirm = () => {
        console.log("inputRef.current:", inputRef.current);
        if (inputRef.current?.value) {
            console.log("inputRef.current.value:", inputRef.current.value);
            console.log("username", username);
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
                    onBlur={(e) => {
                        // This only works if the related target can get focus
                        // see: https://stackoverflow.com/a/42764495
                        if (e.relatedTarget?.contains(confirmRef.current) || e.relatedTarget?.contains(cancelRef.current)) {
                            return;
                        }

                        cancel();
                    }}
                />
                {
                    !editing
                        ? null
                        : (
                            <div className="confirmOptionCreatePost">
                                {/*
                                    These *must* be focusable elements (e.g.
                                    buttons) so that the onblur can check them
                                    using `relatedTarget`
                                */}
                                <button>
                                    <img
                                        ref={confirmRef}
                                        src={right}
                                        alt="certo"
                                        className="rightConfirmOptionCreatePost"
                                        onClick={confirm}
                                    />
                                </button>
                                <button>
                                    <img
                                        ref={cancelRef}
                                        src={exit}
                                        alt="x"
                                        className="exitConfirmOptionCreatePost"
                                        onClick={cancel}
                                    />
                                </button>
                            </div>
                        )
                }
            </div>
        </div>
    );
}
