import React, {useState, useEffect} from 'react';
import {StyleSheet, Text, View, TouchableOpacity} from 'react-native';
import { Magnetometer } from 'expo-sensors';
import { BannerAd, BannerAdSize, InterstitialAd, AdEventType } from 'react-native-google-mobile-ads';

const adUnitId = "ca-app-pub-9890149028563226/7565306387";
const interstitialId = "ca-app-pub-9890149028563226/5859110495";
const interstitial = InterstitialAd.createForAdRequest(interstitialId);

export default function App() {
  const [heading, setHeading] = useState(0);
  const [loaded, setLoaded] = useState(false);
  useEffect(()=>{
    const sub = interstitial.addAdEventListener(AdEventType.LOADED, ()=>setLoaded(true));
    interstitial.load();
    Magnetometer.setUpdateInterval(100);
    const m = Magnetometer.addListener(d=>{
      let a = Math.atan2(d.y,d.x)*(180/Math.PI); a=90-a; if(a<0)a+=360; setHeading(a);
    });
    return ()=>{sub(); m&&m.remove();};
  },[]);
  return (
    <View style={styles.container}>
      <Text style={styles.title}>風水佬Go - {Math.round(heading)}°</Text>
      <View style={[styles.luopan,{transform:[{rotate:`${-heading}deg`}]}]}><Text style={styles.n}>▲北 壬子癸</Text></View>
      <Text style={styles.result}>{heading>120&&heading<150?'財位💰':'吉位轉下'}</Text>
      <TouchableOpacity style={styles.btn} onPress={()=>loaded&&interstitial.show()}><Text style={styles.btnText}>解鎖吉位 {loaded?'':'載入中'}</Text></TouchableOpacity>
      <View style={styles.ad}><BannerAd unitId={adUnitId} size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER} /></View>
    </View>
  );
}
const styles = StyleSheet.create({
  container:{flex:1,backgroundColor:'#0f0f0f',alignItems:'center',paddingTop:80},
  title:{color:'#d4af37',fontSize:22,fontWeight:'bold'},
  luopan:{width:280,height:280,borderRadius:140,borderWidth:4,borderColor:'#d4af37',alignItems:'center',justifyContent:'center',marginTop:40},
  n:{color:'#fff'}, result:{color:'#d4af37',fontSize:20,marginTop:20},
  btn:{backgroundColor:'#d4af37',padding:12,borderRadius:8,marginTop:20}, btnText:{color:'#000',fontWeight:'bold'},
  ad:{position:'absolute',bottom:0,width:'100%'}
});
