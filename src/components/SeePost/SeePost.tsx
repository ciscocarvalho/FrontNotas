import { ChangeEvent, useEffect, useRef, useState } from "react";
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
import { useUsernameContext } from "../../context/UsernameContext";

export type postSee = {
    title: string;
    text?: string;
    media: string[];
    color: string;
    favorite: boolean;
    id: string;
    date: string;
    currentEditors?: string[];
    authentication: ()=>void;
    loadingFunction:(value:boolean)=>void;
    trueDeletePost: boolean;
    authenticationDelete: ()=>void;

  }

export default function SeePost ({color, favorite, id, media, title, text, date, currentEditors, authentication, loadingFunction, authenticationDelete, trueDeletePost}:postSee){

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
    const [_currentEditors, _setCurrentEditors] = useState<string[]>(currentEditors ?? []);

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

    const [isEditing, setIsEditing] = useState(false);
    const timeoutId = useRef<ReturnType<typeof setTimeout>>();

    const HandleChanges = {
        handleText: (e: ChangeEvent<HTMLTextAreaElement>) => {
          setTextN(e.target.value);
          setIsEditing(true);

          if (timeoutId.current) {
            clearTimeout(timeoutId.current);
          }

          timeoutId.current = setTimeout(() => {
            setIsEditing(false);
          }, 500);
        },
        handleTitle:(e:ChangeEvent<HTMLInputElement>)=>{
          setTitleN(e.target.value)
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

    const makeAuthenticationPost = (opts?: any) => {
        return () =>{
            if (!opts?.withoutLoading) {
                loadingFunction(true)
            }

            const newTitle = title === "" ? "Título" : titleN;
            const authenticationWithMedia = (media: string[]) => {
                const post = {
                    title: newTitle,
                    text: textN,
                    favorite: favoriteN,
                    color: colorN,
                    media: media,
                    id: id,
                    date:date,
                    currentEditors: currentEditors ?? [],
            }
                const res = authenticationPU(post)
                res.then(value=>{
                    if(value === "Post updated successfully."){
                        if (!opts?.withoutLoading) {
                            loadingFunction(false)
                        }
                        authentication()
                        setSeeEditPost(false)
                    }
                })
            }

            if (filePreview && filePreview !== media[0]) {
                const cloud = cloudinary(filePreview);
                cloud.then(element=>{
                    const mediaL: string[] = [];
                    mediaL.push(element.secure_url);
                    if (fileName) {
                        mediaL.push(fileName);
                    }
                    mediaL.push(element.public_id);
                    authenticationWithMedia(mediaL);
                });
            }else{
                authenticationWithMedia(media);
            }
        }
    }

    const authenticationPost = makeAuthenticationPost();
    let debounceTimeoutId = useRef<ReturnType<typeof setTimeout>>();

    useEffect(() => {
        if (debounceTimeoutId.current) {
            clearTimeout(debounceTimeoutId.current);
        }

        debounceTimeoutId.current = setTimeout(() => {
            _setCurrentEditors(currentEditors=>{
                currentEditors = (currentEditors ?? []).filter(v=>v !== username);

                if (isEditing) {
                    currentEditors = [...(currentEditors ?? []), username];
                }

                return currentEditors
            })
        }, 250);
    }, [isEditing]);

    const favoriteFunction = () =>{
        setFavoriteN(!favorite)
        const postN = {
            id: id,
            favorite: !favoriteN,
       }
      
        const res = authenticationPU(postN)
        res.then(value=>{
            authentication()
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
        {
            _currentEditors.length === 0
                ? null
                : (
                    <div>
                        <p>({_currentEditors}) editando...</p>
                    </div>
                )
        }
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