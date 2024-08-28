import { ChangeEvent, useCallback, useEffect, useRef, useState } from "react";
import star from "../../assents/Vector.png";
import starYellow from "../../assents/Group 2464.png";
import pencil from "../../assents/ferramenta-lapis.png";
import exit from "../../assents/Vector (1).png"
import paint from "../../assents/balde-de-tinta.png";
import right from "../../assents/marca-de-verificacao.png"
import "./SeePost.scss"
import Color from "../color/Color";
import listColor from "../../assents/color.json"
import React from "react";
import pdf from "../../assents/pdfn.png"
import dowload from "../../assents/dowload.png"
import cloudinary from "../../lib/cloudinary";
import { usePutPosts } from "../../hooks/usePutPosts";
import { useDeletePosts } from "../../hooks/useDeletePosts";
import { socket } from "../../lib/socket";
import { useUsernameContext } from "../../context/UsernameContext";
import { useInitialRender } from "../../hooks/useInitialRender";
import { WS_SERVER_URL } from "../../constants";

type NoteId = string;
type Editor = { clientId: string, username: string };
type Editors = Editor[];

export type postSee = {
    title: string;
    text?: string;
    media: string[];
    color: string;
    favorite: boolean;
    id: string;
    date: string;
    authentication: ()=>void;
    loadingFunction:(value:boolean)=>void;
    trueDeletePost: boolean;
    authenticationDelete: ()=>void;

  }

export default function SeePost ({color, favorite, id, media, title, text, date, authentication, loadingFunction, authenticationDelete, trueDeletePost}:postSee){

    const [titleN, setTitleN] = useState(title)
    const [textN, setTextN] = useState(text)
    const [colorN, setColorN] = useState(color)
    const [favoriteN, setFavoriteN] = useState<boolean>(favorite)
  
    // const [idPostCloud, setIdPostCloud] = useState<string|null>("")
    const [seeColor, setSeeColor] = useState(false)
    const [seeEditPost, setSeeEditPost] = useState(false)
    const [filePreview, setFilePreview] = useState<string | null>(null);
    const [fileName, setFileName] = useState<string | null>(null);
    const {authenticationPU} = usePutPosts()
    const {authenticationDE} = useDeletePosts()
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { username } = useUsernameContext();
    const isInitialRender = useInitialRender();

    const makeEditingMessage = (editors: Editors) => {
        // Although most common cases in which this code will run are triggered
        // by a broadcast on server-side, there will be cases in which this is
        // needed
        const otherEditors = editors.filter((editor) => editor.clientId !== socket.id);
        const usernames = otherEditors.map(({ username }) => username);

        switch (usernames.length) {
            case 0: return "";
            case 1: return `${usernames[0]} está editando...`;
            default: return `${usernames.join(", ")} estão editando...`;
        }
    };

    const [editingMessage, setEditingMessage] = useState(makeEditingMessage([]));

    useEffect(() => {
        if (seeEditPost) {
            socket.emit("editing:start", { noteId: id, username });
        } else if (!isInitialRender) {
            socket.emit("editing:stop", { noteId: id, username });
        }
    }, [seeEditPost, isInitialRender, id, username]);

    useEffect(() => {
        const callback = async () => {
            let res;

            try {
                res = await fetch(`${WS_SERVER_URL}/editing/${id}`, {
                    headers: { "Content-Type": "application/json" },
                });
            } catch (e) {
                return;
            }

            const { data, errors } = await res.json() as { data: any, errors: any[] };

            if (errors) {
                errors.forEach((error) => console.error(error.message));
            }

            const editors = data?.editors;

            if (editors) {
                setEditingMessage(makeEditingMessage(editors));
            }
        };

        callback();
    }, []);

    const onEditingUpdated = useCallback(({ noteId, editors }: { noteId: NoteId, editors: Editors }) => {
        if (noteId === id) {
            setEditingMessage(makeEditingMessage(editors));
        }
    }, [id]);

    useEffect(() => {
        socket.on("editing:start", onEditingUpdated);
        socket.on("editing:stop", onEditingUpdated);

        return () => {
            socket.off("editing:start", onEditingUpdated);
            socket.off("editing:stop", onEditingUpdated);
        };
    }, [onEditingUpdated]);

    useEffect(()=>{
        if(media.length === 3){
            // setIdPostCloud(media[2])
            setFileName(media[1])
            setFilePreview(media[0])
        }else if(media.length === 2){
            // setIdPostCloud(media[1])
            setFilePreview(media[0])
        }
        setTextN(text)
        setTitleN(title)
    },[media, text, title])

    useEffect(()=>{
        
        if(trueDeletePost){
            const res = authenticationDE(id)
            res.then(value=>{
                if(value === "Post deleted successfully."){
                    authentication()
                }
            })
        }
    },[authentication, authenticationDE, id, trueDeletePost])

    const HandleChanges = {
        handleText: (e: ChangeEvent<HTMLTextAreaElement>) => {
          setTextN(e.target.value);
          socket.emit("editing:start", { noteId: id, username });
        },
        handleTitle:(e:ChangeEvent<HTMLInputElement>)=>{
            setTitleN(e.target.value)
          socket.emit("editing:start", { noteId: id, username });
        },
      };

      const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
        setSeeEditPost(true)
        const file = e.target.files?.[0];
        if (file) {
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = () => {
                    setFilePreview(reader.result as string);
                };
                reader.readAsDataURL(file);
                setFileName(null);
            } else if (file.type === 'application/pdf') {
                setFileName(file.name);
                const reader = new FileReader();
                reader.onload = () => {
                    setFilePreview(reader.result as string);
                };
                reader.readAsDataURL(file);
            } else {
                setFileName(file.name);
                setFilePreview(null);
            }
        }
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setSeeEditPost(true)
        const file = e.dataTransfer.files[0];
        if (file) {
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = () => {
                    setFilePreview(reader.result as string);
                };
                reader.readAsDataURL(file);
                setFileName(null);
            } else if (file.type === 'application/pdf') {
                setFileName(file.name);
                const reader = new FileReader();
                reader.onload = () => {
                    setFilePreview(reader.result as string);
                };
                reader.readAsDataURL(file);
            } else {
                setFileName(file.name);
                setFilePreview(null);
            }
        }
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
    };


    const authenticationPost = () =>{
        loadingFunction(true)
       if(title !== titleN || favorite !== favoriteN || text !== textN || color !== colorN || filePreview !== media[0]){
        if(title === ""){
            const mediaL:string[] = []
           if(filePreview && filePreview !== media[0]){
                if(fileName){
                    const cloud = cloudinary(filePreview)
                    cloud.then(element=>{
                        mediaL.push(element.secure_url)
                        mediaL.push(fileName)
                        mediaL.push(element.public_id)

                        const post = {
                            title: "Título",
                            text: textN,
                            favorite: favoriteN,
                            color: colorN,
                            media: mediaL,
                            id: id,
                            date:date
                       }
                        const res = authenticationPU(post)
                        res.then(value=>{
                            if(value === "Post updated successfully."){
                                loadingFunction(false)
                                authentication()
                                setSeeEditPost(false)
                            }
                        })
                    })
                }else{
                    const cloud = cloudinary(filePreview)
                    cloud.then(element=>{
                        mediaL.push(element.secure_url)
                        mediaL.push(element.public_id)

                        const post = {
                            title: "Título",
                            text: textN,
                            favorite: favoriteN,
                            color: colorN,
                            media: mediaL,
                            id: id,
                            date:date
                       }
                        const res = authenticationPU(post)
                        res.then(value=>{
                            if(value === "Post updated successfully."){
                                loadingFunction(false)
                                authentication()
                                setSeeEditPost(false)
                            }
                           
                        })
                    })
                    
                }
           }else{
            const post = {
                title: "Título",
                text: textN,
                favorite: favoriteN,
                color: colorN,
                media: media,
                id: id,
                date:date
           }
            const res = authenticationPU(post)
            res.then(value=>{
                if(value === "Post updated successfully."){
                    loadingFunction(false)
                    authentication()
                    setSeeEditPost(false)
                }
            })
           }

           

        }else{
           
            const mediaL:string[] = []
            if(filePreview && filePreview !== media[0]){
                if(fileName){
                  
                    const cloud = cloudinary(filePreview)
                    cloud.then(element=>{
                        mediaL.push(element.secure_url)
                        mediaL.push(fileName)
                        mediaL.push(element.public_id)
                        const post = {
                            title: titleN,
                            text: textN,
                            favorite: favoriteN,
                            color: colorN,
                            media: mediaL,
                            id: id,
                            date:date
                       }
                        const res = authenticationPU(post)
                        res.then(value=>{
                            if(value === "Post updated successfully."){
                                loadingFunction(false)
                                authentication()
                                setSeeEditPost(false)
                            }
                        })
                    })
                }else{
                    
                    const cloud = cloudinary(filePreview)
                    cloud.then(element=>{
                        mediaL.push(element.secure_url)
                        mediaL.push(element.public_id)

                        const post = {
                            title: titleN,
                            text: textN,
                            favorite: favoriteN,
                            color: colorN,
                            media: mediaL,
                            id: id,
                            date:date
                       }
                        const res = authenticationPU(post)
                        res.then(value=>{
                            if(value === "Post updated successfully."){
                                loadingFunction(false)
                                authentication()
                                setSeeEditPost(false)
                            }
                        })
                    })
                }
           }else{
            const post = {
                title: titleN,
                text: textN,
                favorite: favoriteN,
                color: colorN,
                media: media,
                id: id,
                date:date
           }
            const res = authenticationPU(post)
            res.then(value=>{
                if(value === "Post updated successfully."){
                    loadingFunction(false)
                    authentication()
                    setSeeEditPost(false)
                }
            })
           }
           
        }
       }else{
        console.log("Aqui")
        loadingFunction(false)
        setSeeEditPost(false)
       }
    }

    

    const favoriteFunction = () =>{
        setFavoriteN((favorite)=>!favorite)
        const postN = {
            id: id,
            favorite: !favoriteN,
       }
      
        const res = authenticationPU(postN)
        res.then(value=>{
            if(value === "Post updated successfully."){
                console.log("Aquiiiiiiiii")
                console.log(favorite)
                authentication()
            }
        })
    }

    useEffect(()=>{
        if(seeEditPost === false){
            setColorN(color)
            setFavoriteN(favorite)
            setTextN(text)
            setTitleN(title)
            if(media.length === 3){
                // setIdPostCloud(null)
                setFileName(null)
                setFilePreview(null)
                // setIdPostCloud(media[2])
                setFileName(media[1])
                setFilePreview(media[0])
            }else if(media.length === 2){
                // setIdPostCloud(null)
                setFilePreview(null)
                setFileName(null)
                // setIdPostCloud(media[1])
                setFilePreview(media[0])
            }else{
                // setIdPostCloud(null)
                setFilePreview(null)
                setFileName(null)
            }
        }
    },[color, favorite, media, seeEditPost, text, title])

    

    
    return (
        <main className="allCreatePostN" style={{backgroundColor:colorN}}>
            
        <div className="TitleCreatePost">
            <input type="text" placeholder="Título" value={titleN} onChange={HandleChanges.handleTitle}  onClick={()=>{
                setSeeEditPost(true)
            }}/>
            {favoriteN ? (
                <img 
                    src={starYellow} 
                    alt="estrela amarela" 
                    onClick={() => {
                        favoriteFunction()
                    }

                    } 
                />
            ) : (
                <img 
                    src={star} 
                    alt="estrela" 
                    onClick={() => {
                        favoriteFunction()
                    }} 
                />
            )}
        </div>
        <hr 
            style={{ 
                border: colorN === "#ffffff" 
                    ? "1px solid rgba(217, 217, 217, 1)" 
                    : "1px solid #ffffff" 
            }} 
        />
        <textarea 
            onChange={HandleChanges.handleText} 
            placeholder="Escreva uma descrição ou coloque a baixo um arquivo..." 
            value={textN}
            onClick={()=>{
                setSeeEditPost(true)
            }}
        />
        <p>{editingMessage}</p>
        <div
            className="upload"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
        >
            <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={handleFileSelect}
            />
            {filePreview && fileName == null? (
                <div className="imgFile">
                    <img src={filePreview} className="imgImgFile"  alt="Preview"  />
                    {seeEditPost?(
                        <img 
                        src={exit} 
                        alt="x" 
                        className="exitImg" 
                        onClick={() => {
                            setFilePreview(null);
                            setFileName(null);
                        }} 
                    />
                    ):null}
                </div>
            ) : fileName && filePreview ? (
                <div className="divPdf">
                    <img src={pdf} alt="pdf" className="pdf" />
                    <p >{fileName}</p>
                    {seeEditPost?(
                        <img 
                        src={exit} 
                        alt="x" 
                        className="exitImg" 
                        onClick={() => {
                            setFilePreview(null);
                            setFileName(null);
                        }} 
                    />
                    ):null}
                </div>
            ) : null}
        </div>
        <div className="optionCreatePost">
            <div className="editOptionCreatePost">
                <div 
                    className={seeEditPost 
                        ? "textEditOptionCreatePostSelected" 
                        : "textEditOptionCreatePost"} 
                   onClick={()=>{setSeeEditPost(!seeEditPost)}}
                >
                    <img src={pencil} alt="lápis" />
                </div>
                <div 
                    className={seeColor 
                        ? "colorEditOptionCreatePostSelected" 
                        : "colorEditOptionCreatePost"} 
                    onClick={() => setSeeColor(!seeColor)}
                >
                    <img src={paint} alt="tinta" />
                </div>
               {filePreview?(
                 <div className="dowload">
                   <a href={filePreview} download={filePreview} target="_blank" rel="noopener noreferrer">
                    <img src={dowload} alt="baixar"/>
                   </a>
                  
                 </div>
               ):null}
            </div>
            <div className="confirmOptionCreatePost">
                {seeEditPost?(
                    <img 
                    src={right} 
                    alt="certo" 
                    className="rightConfirmOptionCreatePost" 
                    onClick={authenticationPost} 
                />
                ):null}
                <img 
                    src={exit} 
                    alt="x" 
                    className="exitConfirmOptionCreatePost" 
                    onClick={()=>{
                        authenticationDelete()
                    }}
                />
            </div>
        </div>
        {seeColor && (
            <div className="divColorBall">
                <div className="divColorBallCarrosel">
                    {listColor.map((value) => (
                        <Color 
                            key={value.color} 
                            cor={value.color} 
                            nameColor={value.nameColor} 
                            authentication={() => {
                                setColorN(value.color)
                                setSeeEditPost(true)
                                setSeeColor(false)
                            }} 
                            showColor={value.color === colorN} 
                        />
                    ))}
                </div>
            </div>
        )}
    </main>
    );
    
}