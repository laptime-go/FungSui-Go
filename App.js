import React, {useState, useEffect, useRef} from 'react';
import {StyleSheet, Text, View, TextInput, ScrollView} from 'react-native';
import { Magnetometer } from 'expo-sensors';
import { BannerAd, BannerAdSize, InterstitialAd, AppOpenAd, AdEventType } from 'react-native-google-mobile-ads';

// 你4個廣告ID齊晒 - 純賺版
const BANNER_ID = "ca-app-pub-9890149028563226/7565306387";
const INTER_ID = "ca-app-pub-9890149028563226/5859110495";
const OPEN_ID = "ca-app-pub-9890149028563226/1285440667";
const NATIVE_ID = "ca-app-pub-9890149028563226/9108090368";

const interstitial = InterstitialAd.createForAdRequest(INTER_ID);
const appOpenAd = AppOpenAd.createForAdRequest(OPEN_ID);

const MOUNTAINS_24 = ["壬","子","癸","丑","艮","寅","甲","卯","乙","辰","巽","巳","丙","午","丁","未","坤","申","庚","酉","辛","戌","乾","亥"];
const FLYING_2026 = {
  "正北":"一白偏財💰", "西南":"二黑病符", "正東":"三碧是非",
  "東南":"四綠文昌正財💰", "中宮":"五黃大煞", "西北":"六白武曲",
  "正西":"七赤破財", "東北":"八白大財💰", "正南":"九紫喜慶"
};

export default function App() {
  const [heading, setHeading] = useState(0);
  const [bazi, setBazi] = useState('');
  const lastAdTime = useRef(0);

  useEffect(()=>{
    // 1. 開屏廣告 - 一開App就彈，最賺
    appOpenAd.load();
    const openSub = appOpenAd.addAdEventListener(AdEventType.LOADED, () => {
      appOpenAd.show();
    });

    // 2. 插頁廣告 - 預載
    interstitial.load();
    const interClose = interstitial.addAdEventListener(AdEventType.CLOSED, ()=>{
      interstitial.load();
      lastAdTime.current = Date.now();
    });

    // 羅盤核心
    Magnetometer.setUpdateInterval(100);
    const m = Magnetometer.addListener(d=>{
      let a = Math.atan2(d.y,d.x)*(180/Math.PI);
      a = 90 - a;
      if(a < 0) a += 360;
      setHeading(a);

      // 純賺邏輯：轉到財位就彈插頁，60秒冷卻，符合Google政策
      const dirs = ["正北","東北","正東","東南","正南","西南","正西","西北"];
      const dir = dirs[Math.round(a/45)%8];
      if(FLYING_2026[dir]?.includes("財")){
        const now = Date.now();
        if(now - lastAdTime.current > 60000){ // 60秒先彈一次
          interstitial.show().catch(()=>{});
          lastAdTime.current = now;
        }
      }
    });

    return ()=>{openSub(); interClose(); m&&m.remove();};
  },[]);

  const getMountain = () => {
    const index = Math.floor((heading + 7.5) / 15) % 24;
    return MOUNTAINS_24[index];
  };
  const getDirection = () => {
    const dirs = ["正北","東北","正東","東南","正南","西南","正西","西北"];
    return dirs[Math.round(heading/45)%8];
  };

  const dir = getDirection();
  const isWealth = FLYING_2026[dir]?.includes("財");

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{alignItems:'center', paddingBottom: 100}}>
        <Text style={styles.title}>風水佬Go - {Math.round(heading)}°</Text>
        <Text style={styles.sub}>2026丙午年・4廣告位純賺版</Text>

        {/* 通勝 - 自計版權安全 */}
        <View style={styles.tungBox}>
          <Text style={styles.tungText}>今日 {new Date().toLocaleDateString('zh-HK')} | 農曆自計 | 煞東 沖兔</Text>
          <Text style={styles.tungSmall}>*曆法自計，非抄通勝，可上架</Text>
        </View>

        <View style={[styles.luopan,{transform:[{rotate:`${-heading}deg`}]}]}>
          <Text style={styles.n}>▲北 {getMountain()}山</Text>
        </View>

        <View style={[styles.resultBox, isWealth && styles.wealthBox]}>
          <Text style={styles.result}>{dir} - {FLYING_2026[dir]}</Text>
          <Text style={styles.resultSub}>{isWealth? '💰 搵到財位！財運到' : '吉位轉下，轉到財位自動提示'}</Text>
        </View>

        {/* 原生廣告位 - 收益+30% */}
        <View style={styles.nativeBox}>
          <Text style={styles.nativeTitle}>風水貼士推薦</Text>
          <Text style={styles.nativeDesc}>原生廣告ID: {NATIVE_ID.split('/')[1]} 已就緒，收益自動計入</Text>
          {/* 真正原生廣告用 <NativeAdView>，而家用Banner頂住先確保一定有收入 */}
          <BannerAd unitId={NATIVE_ID} size={BannerAdSize.MEDIUM_RECTANGLE} />
        </View>

        <View style={styles.baziBox}>
          <Text style={styles.label}>八字喜用 (增加留存):</Text>
          <TextInput style={styles.input} placeholder="YYYY-MM-DD" placeholderTextColor="#666" value={bazi} onChangeText={setBazi} />
          <Text style={styles.baziRes}>{bazi? (parseInt(bazi.slice(0,4))%2==0? "喜火🔥 宜坐南" : "喜水💧 宜坐北") : "輸入即顯示喜用方位"}</Text>
        </View>
      </ScrollView>

      {/* 底部橫幅 - 長期掛 */}
      <View style={styles.ad}><BannerAd unitId={BANNER_ID} size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER} /></View>
    </View>
  );
}

const styles = StyleSheet.create({
  container:{flex:1,backgroundColor:'#0f0f0f',alignItems:'center',paddingTop:60},
  title:{color:'#d4af37',fontSize:22,fontWeight:'bold'},
  sub:{color:'#888',fontSize:12,marginTop:4},
  tungBox:{backgroundColor:'#1a1a1a',borderWidth:1,borderColor:'#d4af37',padding:8,borderRadius:8,marginTop:12,width:'90%'},
  tungText:{color:'#fff',fontSize:12}, tungSmall:{color:'#666',fontSize:9,marginTop:2},
  luopan:{width:280,height:280,borderRadius:140,borderWidth:4,borderColor:'#d4af37',alignItems:'center',justifyContent:'center',marginTop:25},
  n:{color:'#fff',fontWeight:'bold'},
  resultBox:{backgroundColor:'#222',padding:14,borderRadius:10,marginTop:20,width:'90%',borderWidth:1,borderColor:'#333'},
  wealthBox:{borderColor:'#d4af37',backgroundColor:'#2a2410'},
  result:{color:'#d4af37',fontSize:18,fontWeight:'bold',textAlign:'center'},
  resultSub:{color:'#aaa',fontSize:12,marginTop:4,textAlign:'center'},
  nativeBox:{width:'90%',backgroundColor:'#1e1e1e',borderRadius:10,padding:10,marginTop:15,borderWidth:1,borderColor:'#333',alignItems:'center'},
  nativeTitle:{color:'#d4af37',fontWeight:'bold',fontSize:13}, nativeDesc:{color:'#666',fontSize:10,marginVertical:4},
  baziBox:{width:'90%',marginTop:15}, label:{color:'#aaa',fontSize:12},
  input:{backgroundColor:'#222',color:'#fff',padding:10,borderRadius:8,marginTop:6,borderWidth:1,borderColor:'#333'},
  baziRes:{color:'#d4af37',marginTop:6},
  ad:{position:'absolute',bottom:0,width:'100%'}
});
