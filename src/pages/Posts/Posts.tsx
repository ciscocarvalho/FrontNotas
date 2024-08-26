import React, { useEffect, useState } from "react";
import './Posts.scss';
import Menu from "../../components/menu/Menu";
import CreatePost from "../../components/createPost/CreatePost";
import { postGet, useGetPosts } from "../../hooks/useGetPosts";
import SeePost from "../../components/SeePost/SeePost";
import next from "../../assents/proximo.png";
import listColorN from "../../assents/color.json"
import Loading from "../../components/loading/Loading";
import WarningMessage from "../../components/warningMessage/WarningMessage";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from '../../api/firebaseConfig'; 
import { getNotas } from "../../lib/elasticApi";

const Posts = () => {
    const { authenticationGP } = useGetPosts();
    const [listFavPost, setListFavPost] = useState<postGet[]>([]);
    const [listPost, setListPost] = useState<postGet[]>([]);
    const [update, setUpdate] = useState(false);
    const [currentIndexFav, setCurrentIndexFav] = useState(0);
    const [currentIndexPost, setCurrentIndexPost] = useState(0);
    const [itemsToShow, setItemToShow] = useState(3);
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const [searchTerm, setSearchTerm] = useState(""); 
    const [colors, setColors] = useState<{ color: string; nameColor: string }[]>([]);
    const [loading,setLoading] = useState(false)
    const [deletePost, setDeletePost] = useState(false)
    const [resDelete, setResDelete] = useState<postGet>()
    const [trueDelete, setTrueDelete] = useState<postGet>()
    const [dateWidth, setDateWidth] = useState(false)

    useEffect(() => {
        const handleResize = () => {
            setWindowWidth(window.innerWidth);
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    useEffect(() => {
        setCurrentIndexFav(0)
        setCurrentIndexPost(0)
        if (windowWidth < 1520) {
            if(windowWidth < 1049) {
                if(windowWidth < 600){
                    setDateWidth(true)
                }else{
                    
                    setItemToShow(1);
                }
            }else{
                setItemToShow(2);
            }
        }else {
            
            setItemToShow(3);
        }
    }, [windowWidth]);

    useEffect(() => {
        setColors(listColorN);
    }, []);

    useEffect(() => {
        const list = authenticationGP();
        list.then(value => {
            if (value.map !== undefined && value.length !== 0) {
                setListFavPost(value.filter(item => item.favorite));
                setListPost(value.filter(item => item.favorite === false));
            }
        });
        // eslint-disable-next-line
    }, []);

    useEffect(() => {
        setListFavPost([]);
        setListPost([]);
        if(searchTerm === ""){
            const unsubscribe = onSnapshot(collection(db, "posts"), (snapshot) => {
            const posts: postGet[] = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as postGet));
        
            posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        
            const filteredFavPosts = posts.filter(item => 
                item.favorite
            );
            
            const filteredPosts = posts.filter(item => 
                item.favorite === false 
            );
        
            setListFavPost(filteredFavPosts);
            setListPost(filteredPosts);
            setLoading(false)
            }, (error) => {
            console.error("Error listening to collection: ", error);
            });
        
            return () => unsubscribe();
        }else{
            const unsubscribe = onSnapshot(collection(db, "posts"), (snapshot) => {
                const posts: postGet[] = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                } as postGet));
            
                const listElastic = getNotas(searchTerm);
                listElastic.then(value => {
                    if (value?.data.map !== undefined) {
                        const updatedData = value.data.map((item: {
                            body: string;
                            timestamp: string;
                        }) => ({
                            ...item,
                            date: item.timestamp,
                            timestamp: undefined,
                            text: item.body,
                            body: undefined,
                        }));
                        updatedData.sort((a: { date: string | number | Date; }, b: { date: string | number | Date; }) => 
                            new Date(b.date).getTime() - new Date(a.date).getTime()
                        );
            
                        const updatedDataMap = new Map<string, any>();
                        updatedData.forEach((item: { id: string; }) => {
                            updatedDataMap.set(item.id, item);
                        });
            
                        posts.forEach(post => {
                            const correspondingItem = updatedDataMap.get(post.id);

                            function areMediaListsEqual(list1: string[], list2: string[]): boolean {
                                if (list1.length !== list2.length) return false;
                                const sortedList1 = [...list1].sort();
                                const sortedList2 = [...list2].sort();
                                return sortedList1.every((value, index) => value === sortedList2[index]);
                            }
            
                            if (correspondingItem && (
                                post.favorite !== correspondingItem.favorite || 
                                post.color !== correspondingItem.color || 
                                post.title !== correspondingItem.title || 
                                post.text !== correspondingItem.text ||
                                !areMediaListsEqual(post.media, correspondingItem.media)
                            )) {
                                setUpdate(!update);
                            } else {
                                return;
                            }
                        });
            
                        console.log(updatedData);
            
                        const filteredFavPosts = updatedData.filter((item: { favorite: boolean; }) => 
                            item.favorite === true
                        );
            
                        const filteredPosts = updatedData.filter((item: { favorite: boolean; }) => 
                            item.favorite === false 
                        );
            
                        setListFavPost(filteredFavPosts);
                        setListPost(filteredPosts);
                        setLoading(false);
                    } else {
                        setListFavPost([]);
                        setListPost([]);
                        setLoading(false);
                    }
                });
            });
            
            return () => unsubscribe();
            
           
        }
      }, [searchTerm, colors, update]);
      
      

    const handleNext = (list: postGet[], setCurrentIndex: React.Dispatch<React.SetStateAction<number>>, currentIndex: number) => {
        if (currentIndex + itemsToShow < list.length) {
            setCurrentIndex(currentIndex + itemsToShow);
        } else {
            setCurrentIndex(0); 
        }
    };

    const handlePrev = (list: postGet[], setCurrentIndex: React.Dispatch<React.SetStateAction<number>>, currentIndex: number) => {
        if (currentIndex - itemsToShow >= 0) {
            setCurrentIndex(currentIndex - itemsToShow);
        } else {
            setCurrentIndex(Math.max(list.length - itemsToShow, 0)); 
        }
    };

    const handleSearchChange = (value: string) => {
        setSearchTerm(value);
        setUpdate(!update)
    };

    const loadinChange = (value:boolean) =>{
        setLoading(value)
    };



    return (
        <main className="allPost">
            {loading?(
                <Loading/>
            ):null}

           {deletePost?(
                 <WarningMessage message="Você quer mesmo deletar o post?" onCancel={()=>{
                    setDeletePost(false)
                 }} onDelete={()=>{
                    setTrueDelete(resDelete)
                 }}/>
           ):null}

            <Menu onSearchChange={handleSearchChange} />
            <CreatePost authentication={() => {
                setUpdate(!update)
                // setSearchTerm("")
            }} loadingFunction={loadinChange}/>
            <section className="listPost">
                <p>Favoritos</p>
                <div className="carousel">
                    <button
                        className={`carousel-button prev ${currentIndexFav === 0 ? 'hidden' : ''}`}
                        onClick={() => handlePrev(listFavPost, setCurrentIndexFav, currentIndexFav)}
                    >
                        <img src={next} alt="Previous" />
                    </button>
                    <div className="overflowListPost">
                       {dateWidth?(
                        <>
                             {listFavPost.map(post => (
                            <SeePost
                                color={post.color}
                                favorite={post.favorite}
                                id={post.id}
                                media={post.media}
                                title={post.title}
                                key={post.id}
                                text={post.text}
                                date={post.date}
                                authentication={() => {
                                    setUpdate(!update)
                                    setDeletePost(false)
                                }}
                                loadingFunction={loadinChange}
                                authenticationDelete={()=>{
                                    setDeletePost(true)
                                    setResDelete(post)
                                }}
                                trueDeletePost={post === trueDelete}
                                
                            />
                        ))}
                        </>
                       ):(
                        <>
                        {listFavPost.slice(currentIndexFav, currentIndexFav + itemsToShow).map(post => (
                            <SeePost
                                color={post.color}
                                favorite={post.favorite}
                                id={post.id}
                                media={post.media}
                                title={post.title}
                                key={post.id}
                                date={post.date}
                                text={post.text}
                                authentication={() => {
                                    setUpdate(!update)
                                    setDeletePost(false)
                                }}
                                loadingFunction={loadinChange}
                                authenticationDelete={()=>{
                                    setDeletePost(true)
                                    setResDelete(post)
                                }}
                                trueDeletePost={post === trueDelete}
                                
                            />
                        ))}
                        </>
                       )}
                    </div>
                    <button
                        className={`carousel-button next ${currentIndexFav + itemsToShow >= listFavPost.length ? 'hidden' : ''}`}
                        onClick={() => handleNext(listFavPost, setCurrentIndexFav, currentIndexFav)}
                    >
                        <img src={next} alt="Next" />
                    </button>
                </div>
            </section>
            <section className="listPost">
                <p>Outros</p>
                <div className="carousel">
                    <button
                        className={`carousel-button prev ${currentIndexPost === 0 ? 'hidden' : ''}`}
                        onClick={() => handlePrev(listPost, setCurrentIndexPost, currentIndexPost)}
                    >
                        <img src={next} alt="Previous" />
                    </button>
                    <div className="overflowListPost">
                        {dateWidth?(
                            <>
                                {listPost.map(post => (
                            <SeePost
                                color={post.color}
                                favorite={post.favorite}
                                id={post.id}
                                media={post.media}
                                title={post.title}
                                key={post.id}
                                text={post.text}
                                date={post.date}
                                authentication={() => {
                                    setUpdate(!update)
                                    setDeletePost(false)
                                }}
                                loadingFunction={loadinChange}
                                authenticationDelete={()=>{
                                    setDeletePost(true)
                                    setResDelete(post)
                                }}
                                trueDeletePost={post === trueDelete}
                            />
                        ))}
                            </>
                        ):(
                            <>
                                {listPost.slice(currentIndexPost, currentIndexPost + itemsToShow).map(post => (
                            <SeePost
                                color={post.color}
                                favorite={post.favorite}
                                id={post.id}
                                media={post.media}
                                title={post.title}
                                key={post.id}
                                text={post.text}
                                date={post.date}
                                authentication={() => {
                                    setUpdate(!update)
                                    setDeletePost(false)
                                }}
                                loadingFunction={loadinChange}
                                authenticationDelete={()=>{
                                    setDeletePost(true)
                                    setResDelete(post)
                                }}
                                trueDeletePost={post === trueDelete}
                            />
                        ))}
                            </>
                        )}
                    </div>
                    <button
                        className={`carousel-button next ${currentIndexPost + itemsToShow >= listPost.length ? 'hidden' : ''}`}
                        onClick={() => handleNext(listPost, setCurrentIndexPost, currentIndexPost)}
                    >
                        <img src={next} alt="Next" />
                    </button>
                </div>
            </section>
        </main>
    );
}

export default Posts;
