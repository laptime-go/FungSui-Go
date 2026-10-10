import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert, Linking, Share } from 'react-native';
import { Magnetometer, Accelerometer } from 'expo-sensors';
import mobileAds, { BannerAd, BannerAdSize, InterstitialAd, AdEventType, AppOpenAd } from 'react-native-google-mobile-ads';
import AsyncStorage from '@react-native-async-storage/async-storage';

const IDS = {
  banner: "ca-app-pub-9890149028563226/7565306387",
  inter: "ca-app-pub-9890149028563226/5859110495",
  appopen: "ca-app-pub-9890149028563226/1285440667",
  native: "ca-app-pub-9890149028563226/9108090368"
};
const MOUNTAINS_24 = ["壬","子","癸","丑","艮","寅","甲","卯","乙","辰","巽","巳","丙","午","丁","未","坤","申","庚","酉","辛","戌","乾","亥"];
const MOUNTAINS_INFO = [
  {m:"壬",gua:"坎",el:"水",eg:"337.5-352.5"}, {m:"子",gua:"坎",el:"水",eg:"352.5-7.5"}, {m:"癸",gua:"坎",el:"水",eg:"7.5-22.5"},
  {m:"丑",gua:"艮",el:"土",eg:"22.5-37.5"}, {m:"艮",gua:"艮",el:"土",eg:"37.5-52.5"}, {m:"寅",gua:"艮",el:"木",eg:"52.5-67.5"},
  {m:"甲",gua:"震",el:"木",eg:"67.5-82.5"}, {m:"卯",gua:"震",el:"木",eg:"82.5-97.5"}, {m:"乙",gua:"震",el:"木",eg:"97.5-112.5"},
  {m:"辰",gua:"巽",el:"土",eg:"112.5-127.5"}, {m:"巽",gua:"巽",el:"木",eg:"127.5-142.5"}, {m:"巳",gua:"巽",el:"火",eg:"142.5-157.5"},
  {m:"丙",gua:"離",el:"火",eg:"157.5-172.5"}, {m:"午",gua:"離",el:"火",eg:"172.5-187.5"}, {m:"丁",gua:"離",el:"火",eg:"187.5-202.5"},
  {m:"未",gua:"坤",el:"土",eg:"202.5-217.5"}, {m:"坤",gua:"坤",el:"土",eg:"217.5-232.5"}, {m:"申",gua:"坤",el:"金",eg:"232.5-247.5"},
  {m:"庚",gua:"兌",el:"金",eg:"247.5-262.5"}, {m:"酉",gua:"兌",el:"金",eg:"262.5-277.5"}, {m:"辛",gua:"兌",el:"金",eg:"277.5-292.5"},
  {m:"戌",gua:"乾",el:"土",eg:"292.5-307.5"}, {m:"乾",gua:"乾",el:"金",eg:"307.5-322.5"}, {m:"亥",gua:"乾",el:"水",eg:"322.5-337.5"},
];
const FLY_2026 = {
  "正北": {star:"一白", name:"偏財位", desc:"2026年一白星飛臨，利財運，適合擺放水種植物", color:"#D4AF37", good:true, lay:"建議擺放水種植物或一杯清水"},
  "東北": {star:"八白", name:"正財位", desc:"2026年八白星飛臨，為當年正財位", color:"#D4AF37", good:true, lay:"建議擺放黃色水晶或財箱"},
  "正東": {star:"三碧", name:"是非位", desc:"三碧星飛臨，注意口舌是非", color:"#FF6B6B", good:false, lay:"建議擺放紅色物品化解"},
  "東南": {star:"四綠", name:"文昌位", desc:"四綠星飛臨，利學習及考試", color:"#51CF66", good:true, lay:"建議擺放文昌塔及綠色植物"},
  "正南": {star:"九紫", name:"喜慶位", desc:"九紫星飛臨，利喜慶及人緣", color:"#FF69B4", good:true, lay:"建議使用紅色佈置"},
  "西南": {star:"二黑", name:"病符位", desc:"二黑星飛臨，注意健康", color:"#888", good:false, lay:"建議擺放銅製葫蘆"},
  "正西": {star:"七赤", name:"破財位", desc:"七赤星飛臨，注意財物", color:"#FF8E53", good:false, lay:"建議擺放一杯清水"},
  "西北": {star:"六白", name:"武曲位", desc:"六白星飛臨，利事業", color:"#D4AF37", good:true, lay:"建議擺放金屬物品"},
};

function calcBazi(dateStr){
  try{
    const d=new Date(dateStr); if(isNaN(d)) return null;
    const stems=["甲","乙","丙","丁","戊","己","庚","辛","壬","癸"];
    const y=d.getFullYear(); const m=d.getMonth()+1; const day=d.getDate();
    const yearStem=stems[(y-4)%10]; const dayStem=stems[(y*5+m*2+day)%10];
    const map={甲:"木",乙:"木",丙:"火",丁:"火",戊:"土",己:"土",庚:"金",辛:"金",壬:"水",癸:"水"};
    const five={木:0,火:0,土:0,金:0,水:0}; [yearStem,dayStem].forEach(s=>{if(map[s]) five[map[s]]++;});
    five.火+=1;
    let weak=Object.entries(five).sort((a,b)=>a[1]-b[1])[0][0];
    const lucky={木:"火 正南 紅色",火:"土 西南 黃色",土:"金 正西 白色",金:"水 正北 黑色",水:"木 正東 綠色"};
    return {yearStem,dayStem,five,xi:weak,lucky:lucky[weak],full:`${y}年${m}月${day}日 日主${dayStem}`};
  }catch{return null;}
}

export default function App(){
  const [tab,setTab]=useState('compass');
  const [heading,setHeading]=useState(0); const [smooth,setSmooth]=useState(0);
  const [adsReady,setAdsReady]=useState(false); const [interReady,setInterReady]=useState(false);
  const [baziInput,setBaziInput]=useState(''); const [baziRes,setBaziRes]=useState(null);
  const [unlockedCai,setUnlockedCai]=useState(false); const [unlockedBazi,setUnlockedBazi]=useState(false);
  const [needCalib,setNeedCalib]=useState(false); const [lastInterTime,setLastInterTime]=useState(0);
  const interRef=useRef(null); const appOpenRef=useRef(null); const lastRaw=useRef(0);

  useEffect(()=>{
    let mag,acc;
    (async()=>{
      if(!(await Magnetometer.isAvailableAsync())) {setNeedCalib(true); return;}
      await Magnetometer.setUpdateIntervalAsync(80);
      await Accelerometer.setUpdateIntervalAsync(80);
      acc=Accelerometer.addListener(()=>{});
      mag=Magnetometer.addListener(({x,y})=>{
        const str=Math.sqrt(x*x+y*y); setNeedCalib(str<20||str>70);
        let a=Math.atan2(y,x)*180/Math.PI; a=90-a; if(a<0)a+=360;
        let diff=a-lastRaw.current; if(Math.abs(diff)>180) diff=diff>0?diff-360:diff+360;
        if(Math.abs(diff)>1){ lastRaw.current=(lastRaw.current+diff*0.18+360)%360; setHeading(Math.round(lastRaw.current)); }
      });
      const saved=await AsyncStorage.getItem('bazi_v1'); if(saved) setBaziInput(saved);
    })();
    return()=>{mag?.remove(); acc?.remove();};
  },[]);
  useEffect(()=>{ const t=setInterval(()=>{ let d=heading-smooth; if(Math.abs(d)>180)d=d>0?d-360:d+360; if(Math.abs(d)>0.2)setSmooth(s=>(s+d*0.15+360)%360); },16); return()=>clearInterval(t); },[heading,smooth]);
  useEffect(()=>{
    const tm=setTimeout(async()=>{
      try{
        await mobileAds().initialize(); setAdsReady(true);
        const inter=InterstitialAd.createForAdRequest(IDS.inter,{requestNonPersonalizedAdsOnly:true});
        interRef.current=inter; inter.load();
        inter.addAdEventListener(AdEventType.LOADED,()=>setInterReady(true));
        inter.addAdEventListener(AdEventType.CLOSED,()=>{ setLastInterTime(Date.now()); inter.load(); });
        const appOpen=AppOpenAd.createForAdRequest(IDS.appopen,{requestNonPersonalizedAdsOnly:true});
        appOpenRef.current=appOpen; appOpen.load();
      }catch{}
    },2000);
    return()=>clearTimeout(tm);
  },[]);

  const idx=Math.floor((smooth+7.5)/15)%24; const curM=MOUNTAINS_INFO[idx];
  const dirs=["正北","東北","正東","東南","正南","西南","正西","西北"]; const curDir=dirs[Math.round(smooth/45)%8]; const fly=FLY_2026[curDir]||FLY_2026["正北"];

  const showInter = (cb)=>{
    const now=Date.now();
    if(interReady && now-lastInterTime>90000 && interRef.current){
      const unsub=interRef.current.addAdEventListener(AdEventType.CLOSED,()=>{ cb(); unsub(); });
      interRef.current.show().catch(()=>cb());
    } else { cb(); }
  };

  if(tab==='settings'){
    return (
      <View style={s.c}>
        <ScrollView style={{width:'100%'}} contentContainerStyle={{padding:16,paddingTop:45,paddingBottom:130}}>
          <Text style={s.title}>設定</Text>
          <Text style={s.sub}>風水羅盤指南 v1.0 • versionCode 1</Text>

          <View style={s.setCard}><Text style={s.setT}>羅盤校準 {needCalib?'需校準':''}</Text><Text style={s.setD}>當前 {Math.round(smooth)}° {curM.m}山 {curM.gua}卦{'\n'}如度數停滯，請將裝置平放並以8字形移動數次進行校準。</Text>
            <TouchableOpacity style={s.gold} onPress={()=>Alert.alert('校準說明','1. 將裝置平放\n2. 以8字形移動數次\n3. 直至度數正常跳動')}><Text style={s.goldT}>查看校準說明</Text></TouchableOpacity>
          </View>

          <View style={s.setCard}><Text style={s.setT}>資料管理</Text><Text style={s.setD}>已儲存生日：{baziInput||'未設定'}</Text>
            <TouchableOpacity style={s.dark} onPress={async()=>{ if(baziInput) { await AsyncStorage.setItem('bazi_v1',baziInput); Alert.alert('已儲存'); } }}><Text style={s.darkT}>儲存資料</Text></TouchableOpacity>
            <TouchableOpacity style={[s.dark,{marginTop:8,borderColor:'#999'}]} onPress={async()=>{ await AsyncStorage.clear(); setBaziInput(''); setBaziRes(null); setUnlockedCai(false); setUnlockedBazi(false); Alert.alert('已清除'); }}><Text style={s.darkT}>清除資料</Text></TouchableOpacity>
          </View>

          <View style={s.setCard}><Text style={s.setT}>關於應用</Text><Text style={s.setD}>風水羅盤指南 v1.0 (1){'\n'}本應用提供傳統羅盤及流年方位參考，內容僅供文化及娛樂參考。{'\n'}套件：com.laptimego.fungsui{'\n'}SDK 51.0.28 • 目標 API 36{'\n'}廣告狀態：{adsReady?'已就緒':''}</Text>
            <TouchableOpacity style={s.dark} onPress={()=>Share.share({message:'風水羅盤指南 - 2026年方位參考'})}><Text style={s.darkT}>分享應用</Text></TouchableOpacity>
            <TouchableOpacity style={[s.dark,{marginTop:8}]} onPress={()=>Linking.openURL('https://www.google.com/policies/privacy/')}><Text style={s.darkT}>私隱政策</Text></TouchableOpacity>
          </View>

          <Text style={{color:'#333',fontSize:10,marginTop:16,textAlign:'center'}}>本應用內容僅供參考及娛樂用途 • v1.0</Text>
        </ScrollView>
        <View style={s.tabBar}><TouchableOpacity style={s.tab} onPress={()=>setTab('compass')}><Text style={s.tabOff}>羅盤</Text></TouchableOpacity><TouchableOpacity style={s.tab} onPress={()=>setTab('bazi')}><Text style={s.tabOff}>八字</Text></TouchableOpacity><TouchableOpacity style={[s.tab,s.tabOn]}><Text style={s.tabOnT}>設定</Text></TouchableOpacity></View>
        <View style={s.bot}>{adsReady && <BannerAd unitId={IDS.banner} size={BannerAdSize.BANNER} />}</View>
      </View>
    );
  }

  if(tab==='bazi'){
    return (
      <View style={s.c}>
        <ScrollView style={{width:'100%'}} contentContainerStyle={{alignItems:'center',paddingTop:35,paddingBottom:130}}>
          <Text style={s.title}>八字參考</Text><Text style={s.sub}>僅供文化及娛樂參考</Text>
          <View style={[s.card,{width:'92%'}]}>
            <TextInput style={s.inp} value={baziInput} onChangeText={setBaziInput} placeholder="YYYY-MM-DD 例如 1990-05-20" placeholderTextColor="#666"/>
            <TouchableOpacity style={s.gold} onPress={()=>{ const r=calcBazi(baziInput); if(!r){ setBaziRes({error:"請輸入正確格式 YYYY-MM-DD"}); return; } setBaziRes(r); AsyncStorage.setItem('bazi_v1',baziInput); showInter(()=>setUnlockedBazi(true)); }}><Text style={s.goldT}>查看分析</Text></TouchableOpacity>
            {baziRes && (
              <View style={s.unlock}>
                {baziRes.error? <Text style={{color:'#ff6666'}}>{baziRes.error}</Text> : <>
                  <Text style={s.ut}>{baziRes.full}</Text>
                  <Text style={[s.ut,{color:'#D4AF37',fontWeight:'bold'}]}>參考喜用：{baziRes.xi} • 宜 {baziRes.lucky}</Text>
                  <Text style={s.ut}>以上為傳統五行參考，僅供娛樂。</Text>
                </>}
              </View>
            )}
          </View>
          <View style={s.nativeBox}>{adsReady && <BannerAd unitId={IDS.native} size={BannerAdSize.MEDIUM_RECTANGLE} />}</View>
        </ScrollView>
        <View style={s.tabBar}><TouchableOpacity style={s.tab} onPress={()=>setTab('compass')}><Text style={s.tabOff}>羅盤</Text></TouchableOpacity><TouchableOpacity style={[s.tab,s.tabOn]}><Text style={s.tabOnT}>八字</Text></TouchableOpacity><TouchableOpacity style={s.tab} onPress={()=>setTab('settings')}><Text style={s.tabOff}>設定</Text></TouchableOpacity></View>
        <View style={s.bot}>{adsReady && <BannerAd unitId={IDS.banner} size={BannerAdSize.BANNER} />}</View>
      </View>
    );
  }

  return (
    <View style={s.c}>
      <ScrollView style={{width:'100%'}} contentContainerStyle={{alignItems:'center',paddingTop:30,paddingBottom:140}}>
        <Text style={s.title}>風水羅盤指南 {Math.round(smooth)}°</Text>
        <Text style={s.sub}>2026年參考 • {curDir} {fly.star}{fly.name} • {curM.m}山{curM.gua}卦</Text>

        <View style={s.panWrap}>
          <View style={[s.pan,{transform:[{rotate:`${-smooth}deg`}]}]}>
            {MOUNTAINS_24.map((m,i)=>(<View key={m} style={[s.mk,{transform:[{rotate:`${i*15}deg`},{translateY:-118}]}]}><Text style={[s.mt,curM.m===m&&s.mtOn]}>{m}</Text></View>))}
            {["坎","艮","震","巽","離","坤","兌","乾"].map((g,i)=>(<View key={g} style={[s.mk2,{transform:[{rotate:`${i*45}deg`},{translateY:-88}]}]}><Text style={s.mt2}>{g}</Text></View>))}
            <View style={s.dot}><Text style={{fontWeight:'bold'}}>{curM.m}</Text></View>
          </View>
          <View style={s.fixed}><Text style={{color:'red',fontSize:16,fontWeight:'bold'}}>▼ {Math.round(smooth)}°</Text></View>
        </View>

        <View style={[s.card,{borderColor:fly.color}]}>
          <Text style={[s.cardT,{color:fly.color}]}>{curDir} {fly.star}{fly.name} • {curM.m}山{curM.el}</Text>
          <Text style={s.cardD}>{fly.desc}</Text>
          <Text style={s.cardD}>{fly.lay}</Text>
          {!unlockedCai? <TouchableOpacity style={s.gold} onPress={()=>showInter(()=>setUnlockedCai(true))}><Text style={s.goldT}>查看詳細說明</Text></TouchableOpacity> :
            <View style={s.unlock}><Text style={s.ut}>方位：{curDir}</Text><Text style={s.ut}>坐向：{curM.m}山 {curM.eg}°</Text><Text style={s.ut}>{fly.lay}</Text><Text style={s.ut}>以上內容僅供文化參考。</Text></View>}
        </View>

        <View style={s.nativeBox}><Text style={s.adLab}>推薦內容</Text>{adsReady && <BannerAd unitId={IDS.native} size={BannerAdSize.MEDIUM_RECTANGLE} />}</View>
        <Text style={{color:'#333',fontSize:10,marginTop:10,textAlign:'center'}}>內容僅供參考及娛樂用途 • v1.0 (1) • {curM.m}山</Text>
      </ScrollView>
      <View style={s.tabBar}><TouchableOpacity style={[s.tab,s.tabOn]}><Text style={s.tabOnT}>羅盤</Text></TouchableOpacity><TouchableOpacity style={s.tab} onPress={()=>setTab('bazi')}><Text style={s.tabOff}>八字</Text></TouchableOpacity><TouchableOpacity style={s.tab} onPress={()=>setTab('settings')}><Text style={s.tabOff}>設定</Text></TouchableOpacity></View>
      <View style={s.bot}>{adsReady && <BannerAd unitId={IDS.banner} size={BannerAdSize.BANNER} />}</View>
    </View>
  );
}
const s=StyleSheet.create({
  c:{flex:1,backgroundColor:'#080808',alignItems:'center'},
  title:{color:'#d4af37',fontSize:20,fontWeight:'bold'}, sub:{color:'#777',fontSize:11,marginTop:3},
  panWrap:{width:300,height:300,alignItems:'center',justifyContent:'center',marginTop:12},
  pan:{width:270,height:270,borderRadius:135,borderWidth:2,borderColor:'#d4af37',backgroundColor:'#121212',alignItems:'center',justifyContent:'center'},
  mk:{position:'absolute',top:'50%',left:'50%',width:22,marginLeft:-11,alignItems:'center'}, mt:{color:'#666',fontSize:11}, mtOn:{color:'#000',backgroundColor:'#d4af37',fontWeight:'bold',borderRadius:4,paddingHorizontal:3},
  mk2:{position:'absolute',top:'50%',left:'50%',width:26,marginLeft:-13,alignItems:'center'}, mt2:{color:'#3a3a3a',fontSize:9},
  dot:{width:42,height:42,borderRadius:21,backgroundColor:'#d4af37',alignItems:'center',justifyContent:'center'},
  fixed:{position:'absolute',top:-2},
  card:{width:'92%',backgroundColor:'#181818',borderRadius:14,padding:13,marginTop:12,borderWidth:1,borderColor:'#2a2a2a'},
  cardT:{color:'#d4af37',fontSize:15,fontWeight:'bold'}, cardD:{color:'#aaa',fontSize:12,marginTop:5,lineHeight:16},
  gold:{backgroundColor:'#d4af37',padding:12,borderRadius:10,marginTop:10,alignItems:'center'}, goldT:{color:'#000',fontWeight:'bold'},
  dark:{borderWidth:1,borderColor:'#d4af37',padding:12,borderRadius:10,alignItems:'center'}, darkT:{color:'#d4af37',fontWeight:'bold'},
  unlock:{backgroundColor:'#222',padding:10,borderRadius:9,marginTop:10}, ut:{color:'#ddd',fontSize:12,marginTop:4,lineHeight:16},
  nativeBox:{width:'92%',backgroundColor:'#111',borderRadius:12,padding:7,marginTop:12,alignItems:'center',minHeight:268,borderWidth:1,borderColor:'#222'},
  adLab:{color:'#444',fontSize:9,marginBottom:4}, inp:{backgroundColor:'#222',color:'#fff',padding:12,borderRadius:9,borderWidth:1,borderColor:'#333',marginTop:8},
  tabBar:{position:'absolute',bottom:52,flexDirection:'row',width:'100%',backgroundColor:'#111',borderTopWidth:1,borderColor:'#222',height:50},
  tab:{flex:1,alignItems:'center',justifyContent:'center'}, tabOn:{backgroundColor:'#1e1e1e'}, tabOnT:{color:'#d4af37',fontWeight:'bold'}, tabOff:{color:'#666'},
  bot:{position:'absolute',bottom:0,width:'100%',alignItems:'center',backgroundColor:'#000',height:52},
  setCard:{width:'100%',backgroundColor:'#161616',borderRadius:12,padding:14,marginTop:12,borderWidth:1,borderColor:'#2a2a2a'},
  setT:{color:'#fff',fontSize:15,fontWeight:'bold'}, setD:{color:'#888',fontSize:12,marginTop:6,lineHeight:17},
});
