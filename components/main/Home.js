import React, { useEffect, useState } from 'react';

//Tags
import { StyleSheet, View, FlatList, Text, Image, Button, TouchableOpacity } from 'react-native';

//Element Header from react-native-paper library
import { Appbar } from 'react-native-paper';

//Redux library
import { connect } from 'react-redux';

function Home(props, { navigation }) {

    const [recipes, setRecipes] = useState([]);
    const { currentUser } = props;
    
    useEffect(() => {
        fetchRecipes();
    }, [])

    useEffect(() => {
        const unsubscribe = props.navigation.addListener('focus', () => {
            fetchRecipes();
        });
    
        return unsubscribe;
    }, [navigation]);
    
    const fetchRecipes = async() => {
        await fetch('http://ruppinmobile.tempdomain.co.il/site08/api/recipes', {
            method: 'GET',
            headers: {
                'Accept': 'application/json; charset=UTF-8',
                'Content-type': 'application/json'
            },
        }).then(res => {
            console.log('res.status', res.status);
            return res.json()
        }).then(async (result) => {
            if (result) {
                setRecipes(result)
            } else {
                console.log('error')
            }
        })
    }
    
    const onLikePress = async (item) => {
        await Promise.all([
            await fetch('http://ruppinmobile.tempdomain.co.il/site08/api/favorites', {
                method: 'POST',
                headers: new Headers({
                    'Accept': 'application/json; charset=UTF-8',
                    'Content-type': 'application/json'
                }),
                body: JSON.stringify({
                    "userID": currentUser.id,
                    "recipeID": item.recipeID,
                    "likes": true,
                    "recipeIMG": item.recipeIMG,
                    "recipeNAME": item.recipeNAME,
                    "recipeTIME": item.recipeTIME,
                    "recipeDESC": item.recipeDESC,
                })
            }),
            await fetch("http://ruppinmobile.tempdomain.co.il/site08/api/recipes" + "/" + item.recipeID, {
                method: 'PUT',
                headers: new Headers({
                    'Accept': 'application/json; charset=UTF-8',
                    'Content-type': 'application/json'
                }),
                body: JSON.stringify({
                    "recipeID": item.recipeID,
                    "recipeTOKEN": item.recipeTOKEN,
                    "recipeIMG": item.recipeIMG,
                    "recipeNAME": item.recipeNAME,
                    "recipeTIME": item.recipeTIME,
                    "recipeDESC": item.recipeDESC,
                    "likes": true
                }),
            }),
        ]).then(([res1, res2]) => Promise.all([res1.json(), res2.json()]))
            .then(([data1, data2]) => {
                console.log(data1, data2)
            }, (error) => {
                console.log(error)
            });
    }
    
    const onDisLikePress = async (item) => {
        Promise.all([
            await fetch('http://ruppinmobile.tempdomain.co.il/site08/api/favorites' + "/" + item.recipeID, {
                method: 'DELETE',
                headers: new Headers({
                    'Accept': 'application/json; charset=UTF-8',
                    'Content-type': 'application/json'
                }),
            }),
            await fetch("http://ruppinmobile.tempdomain.co.il/site08/api/recipes" + "/" + item.recipeID, {
                method: 'PUT',
                headers: new Headers({
                    'Accept': 'application/json; charset=UTF-8',
                    'Content-type': 'application/json'
                }),
                body: JSON.stringify({
                    "recipeID": item.recipeID,
                    "recipeTOKEN": item.recipeTOKEN,
                    "recipeIMG": item.recipeIMG,
                    "recipeNAME": item.recipeNAME,
                    "recipeTIME": item.recipeTIME,
                    "recipeDESC": item.recipeDESC,
                    "likes": false
                }),
            })
        ]).then(([res1, res2]) => Promise.all([res1.json(), res2.json()]))
            .then(([data1, data2]) => {
                console.log(data1, data2)
            }, (error) => {
                console.log(error)
            });
    }

    const LikeButton = ({ onPress }) => (
        <TouchableOpacity onPress={onPress}>
          <Image
            source={require("../../assets/Like.png")}
            style={{ marginTop: 5, width: 40, height: 40}}
          />
        </TouchableOpacity>
      );
    
      const DisLikeButton = ({ onPress, title }) => (
        <TouchableOpacity onPress={onPress}>
          <Image
            source={require("../../assets/DisLike.png")}
            style={{ marginTop: 5, width: 40, height: 40}}
          />
        </TouchableOpacity>
      );

    return (
        <View style={styles.container}>
            <Appbar.Header style={{ backgroundColor: '#fff' }}>
                <Appbar.Content title={<Text style={{ fontWeight: '600' }}>Yummy</Text>} subtitle="Home" />
            </Appbar.Header>
            <View style={styles.containerGallery}>
                <FlatList
                    numColumns={1}
                    horizontal={false}
                    data={recipes}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={({ item, index }) => (
                        <View key={index} style={{ marginBottom: 50, backgroundColor: '#f7f7f7'}}>
                                 <Text style={{ paddingHorizontal: 10, paddingVertical: 10, fontSize: 18, fontWeight: '700'}}>{item.recipeNAME}</Text>
                                 <View style={styles.containerImage}>
                                     <Image
                                        id={item.recipeID}
                                        style={styles.image}
                                        source={{ uri: `data:image/image;base64,${item.recipeIMG}` }}
                                     />
                                     <View style={{ paddingHorizontal: 10}}>
                                     <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                         <View style={{ flexDirection: 'row', alignItems: 'center' }} >
                                         {item.likes ? 
                                         <DisLikeButton
                                            title="DisLike"
                                            onPress={() => onDisLikePress(item)}
                                         />
                                         :
                                         <LikeButton
                                            title="Like"
                                            onPress={() => onLikePress(item)}
                                         />}
                                         </View>
                                        <Button title="Full Recipe" onPress={() => props.navigation.navigate("Recipe", { item })} />
                                     </View>
                                     <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', margin: 5, marginBottom: 10 }}>
                                         <Text>{(item.recipeDESC.length > 40) ? (((item.recipeDESC).substring(0, 40 - 3)) + '...') : item.recipeDESC}</Text>
                                    </View>
                                    </View>
                                 </View>
                         </View>
                        
                    )}
                />
            </View>
        </View>
    );
}

//Css
const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    containerGallery: {
        flex: 1,
    },
    containerImage: {
        flex: 1 / 3,
    },
    image: {
        flex: 1,
        aspectRatio: 1 / 1,
        borderRadius: 4
    }
})

const mapStateToProps = (store) => ({
    currentUser: store.userState.currentUser,
})

export default connect(mapStateToProps, null)(Home);