import React, { useState, useEffect, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert, Share } from 'react-native';
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
  {m:"壬",gua:"坎",wu:"水",deg:"337.5-352.5",cai:"偏財"}, {m:"子",gua:"坎",wu:"水",deg:"352.5-7.5",cai:"帝旺"},
  {m:"癸",gua:"坎",wu:"水",deg:"7.5-22.5",cai:"橫財"}, {m:"丑",gua:"艮",wu:"土",deg:"22.5-37.5",cai:"金庫"},
  {m:"艮",gua:"艮",wu:"土",deg:"37.5-52.5",cai:"地產"}, {m:"寅",gua:"艮",wu:"木",deg:"52.5-67.5",cai:"創業"},
  {m:"甲",gua:"震",wu:"木",deg:"67.5-82.5",cai:"正財"}, {m:"卯",gua:"震",wu:"木",deg:"82.5-97.5",cai:"旺財"},
  {m:"乙",gua:"震",wu:"木",deg:"97.5-112.5",cai:"小財"}, {m:"辰",gua:"巽",wu:"土",deg:"112.5-127.5",cai:"財庫"},
  {m:"巽",gua:"巽",wu:"木",deg:"127.5-142.5",cai:"文昌財"}, {m:"巳",gua:"巽",wu:"火",deg:"142.5-157.5",cai:"快財"},
  {m:"丙",gua:"離",wu:"火",deg:"157.5-172.5",cai:"名氣財"}, {m:"午",gua:"離",wu:"火",deg:"172.5-187.5",cai:"旺財"},
  {m:"丁",gua:"離",wu:"火",deg:"187.5-202.5",cai:"暗財"}, {m:"未",gua:"坤",wu:"土",deg:"202.5-217.5",cai:"田宅"},
  {m:"坤",gua:"坤",wu:"土",deg:"217.5-232.5",cai:"財庫位"}, {m:"申",gua:"坤",wu:"金",deg:"232.5-247.5",cai:"貴人財"},
  {m:"庚",gua:"兌",wu:"金",deg:"247.5-262.5",cai:"武財"}, {m:"酉",gua:"兌",wu:"金",deg:"262.5-277.5",cai:"兌現"},
  {m:"辛",gua:"兌",wu:"金",deg:"277.5-292.5",cai:"珠寶財"}, {m:"戌",gua:"乾",wu:"土",deg:"292.5-307.5",cai:"大庫"},
  {m:"乾",gua:"乾",wu:"金",deg:"307.5-322.5",cai:"天財"}, {m:"亥",gua:"乾",wu:"水",deg:"322.5-337.5",cai:"長線財"},
];
const FLY_2026 = {
  "正北": {star:"一白", name:"偏財位", cai:95, color:"#D4AF37", good:true, desc:"2026一白入正北，最大偏財位", lay:"正北放一杯清水+6枚硬幣，養黑魚，錢包向北，忌紅色。"},
  "東北": {star:"八白", name:"正財帝位", cai:99, color:"#FFD700", good:true, desc:"2026八白最旺，正財帝王位", lay:"東北放黃水晶聚寶盆+五帝錢，保險箱放此位，最旺。"},
  "正東": {star:"三碧", name:"是非位", cai:20, color:"#FF6B6B", good:false, desc:"三碧是非，易有合約破財", lay:"放紅地氈+紅燈，用紅文件夾，忌魚缸。"},
  "東南": {star:"四綠", name:"文昌位", cai:82, color:"#51CF66", good:true, desc:"文昌利考試寫作流量", lay:"四枝富貴竹+文昌塔放東南，直播寫嘢向東南。"},
  "正南": {star:"九紫", name:"喜慶位", cai:90, color:"#FF69B4", good:true, desc:"九紫喜慶，人緣財", lay:"9枝紅花+紅燈放正南，喜慶直播帶貨。"},
  "西南": {star:"二黑", name:"病符位", cai:15, color:"#888", good:false, desc:"二黑病符注意健康破財", lay:"銅葫蘆+五帝錢，保持整潔。"},
  "正西": {star:"七赤", name:"破財位", cai:25, color:"#FF8E53", good:false, desc:"七赤易被盜騙", lay:"一杯清水+藍地氈，錢包唔放西。"},
  "西北": {star:"六白", name:"貴人位", cai:88, color:"#D4AF37", good:true, desc:"六白貴人帶財", lay:"金屬風鈴+六帝錢放西北，向西北坐談生意。"},
};
function calcBazi(dateStr){
  try{
    const d=new Date(dateStr); if(isNaN(d)) return null;
    const stems=["甲","乙","丙","丁","戊","己","庚","辛","壬","癸"];
    const y=d.getFullYear(); const m=d.getMonth()+1; const day=d.getDate();
    const yearStem=stems[(y-4)%10]; const dayStem=stems[(day*2+m)%10];
    const map={甲:"木",乙:"木",丙:"火",丁:"火",戊:"土",己:"土",庚:"金",辛:"金",壬:"水",癸:"水"};
    const five={木:1,火:1,土:1,金:1,水:1}; five[map[yearStem]]++; five[map[dayStem]]++;
    const weak=Object.entries(five).sort((a,b)=>a[1]-b[1])[0][0];
    const lucky={木:{el:"火",dir:"正南",col:"紅紫色",num:"2,7"},火:{el:"土",dir:"西南",col:"黃色",num:"5,0"},土:{el:"金",dir:"正西",col:"白金色",num:"4,9"},金:{el:"水",dir:"正北",col:"黑藍色",num:"1,6"},水:{el:"木",dir:"正東",col:"綠色",num:"3,8"}};
    return {full:`${y}年 ${yearStem}命 日主${dayStem}`, five, xi:weak,...lucky[weak]};
  }catch{ return null; }
}

export default function App(){
  const [tab,setTab]=useState('compass');
  const [heading,setHeading]=useState(0); const [smooth,setSmooth]=useState(0);
  const [adsReady,setAdsReady]=useState(false); const [interReady,setInterReady]=useState(false);
  const [baziInput,setBaziInput]=useState(''); const [baziRes,setBaziRes]=useState(null);
  const [unlockedCai,setUnlockedCai]=useState(false); const [needCalib,setNeedCalib]=useState(false); const [lastInter,setLastInter]=useState(0);
  const interRef=useRef(null); const lastRaw=useRef(0);
  const acc=useRef({x:0,y:0,z:9.81}); const magF=useRef({x:0,y:0,z:0});

  useEffect(()=>{
    let mSub,aSub; let first=true;
    (async()=>{
      const ok=await Magnetometer.isAvailableAsync(); if(!ok){ setNeedCalib(true); return; }
      await Magnetometer.setUpdateIntervalAsync(60);
      await Accelerometer.setUpdateIntervalAsync(60);
      aSub=Accelerometer.addListener(d=>acc.current=d);
      mSub=Magnetometer.addListener(d=>{
        if(first){ magF.current=d; first=false; }
        else { magF.current.x=magF.current.x*0.75+d.x*0.25; magF.current.y=magF.current.y*0.75+d.y*0.25; magF.current.z=magF.current.z*0.75+d.z*0.25; }
        const {x,y,z}=magF.current; const {x:ax,y:ay,z:az}=acc.current;
        let a;
        if(Math.abs(az)>0.2){
          const roll=Math.atan2(ay,az); const pitch=Math.atan2(-ax, Math.hypot(ay,az));
          const mx=x*Math.cos(pitch)+z*Math.sin(pitch);
          const my=x*Math.sin(roll)*Math.sin(pitch)+y*Math.cos(roll)-z*Math.sin(roll)*Math.cos(pitch);
          if(!isFinite(mx)||!isFinite(my)) return;
          a=Math.atan2(-my,mx)*180/Math.PI;
        } else { a=Math.atan2(y,x)*180/Math.PI; }
        a=(a+360)%360;
        setNeedCalib(Math.hypot(x,y,z)<12||Math.hypot(x,y,z)>90);
        let diff=a-lastRaw.current; if(diff>180) diff-=360; if(diff<-180) diff+=360;
        lastRaw.current=(lastRaw.current+diff*0.38+360)%360;
        setHeading(lastRaw.current);
      });
      const sv=await AsyncStorage.getItem('bazi_v1'); if(sv) setBaziInput(sv);
    })();
    return()=>{mSub?.remove(); aSub?.remove();};
  },[]);
  useEffect(()=>{ const t=setInterval(()=>{ let d=heading-smooth; if(d>180)d-=360; if(d<-180)d+=360; if(Math.abs(d)>0.01) setSmooth(v=>(v+d*0.2+360)%360); },16); return()=>clearInterval(t); },[heading,smooth]);
  useEffect(()=>{ setTimeout(async()=>{ try{ await mobileAds().initialize(); setAdsReady(true); const inter=InterstitialAd.createForAdRequest(IDS.inter,{requestNonPersonalizedAdsOnly:true}); interRef.current=inter; inter.load(); inter.addAdEventListener(AdEventType.LOADED,()=>setInterReady(true)); inter.addAdEventListener(AdEventType.CLOSED,()=>{ setLastInter(Date.now()); inter.load(); }); AppOpenAd.createForAdRequest(IDS.appopen,{requestNonPersonalizedAdsOnly:true}).load(); }catch{} },800); },[]);

  const currentMountain=useMemo(()=>{ const i=Math.floor((smooth+7.5)/15)%24; return MOUNTAINS_INFO[i]; },[smooth]);
  const dirs=["正北","東北","正東","東南","正南","西南","正西","西北"]; const currentDir=dirs[Math.round(smooth/45)%8]; const fly=FLY_2026[currentDir]||FLY_2026["正北"];
  const showInter=(cb)=>{ Alert.alert("提示","查看詳細佈局將播放廣告，可跳過",[{text:"取消",style:"cancel"},{text:"繼續",onPress:()=>{ const now=Date.now(); if(interReady&&now-lastInter>25000&&interRef.current){ const u=interRef.current.addAdEventListener(AdEventType.CLOSED,()=>{cb();u();}); interRef.current.show().catch(()=>cb()); } else cb(); }}]); };

  if(tab==='settings'){
    return (
      <View style={s.container}>
        <ScrollView style={{width:'100%'}} contentContainerStyle={{padding:16,paddingTop:45,paddingBottom:130}}>
          <Text style={s.title}>設定</Text><Text style={s.sub}>風水佬Go • {Math.round(smooth)}° 實時</Text>
          <View style={s.setCard}><Text style={s.setT}>羅盤 {needCalib?'⚠️需校準':'✓ '+Math.round(smooth)+'° 正常'}</Text><Text style={s.setD}>當前 {currentMountain.m}山 {currentMountain.gua} {currentMountain.wu}行 • {currentMountain.deg}°{'\n'}已修復0°問題。</Text><TouchableOpacity style={s.goldBtn} onPress={()=>Alert.alert('校準','平放畫8字5次，遠離磁鐵')}><Text style={s.goldBtnText}>校準教學</Text></TouchableOpacity></View>
          <View style={s.setCard}><Text style={s.setT}>資料</Text><Text style={s.setD}>{baziInput||'未設定'}</Text><TouchableOpacity style={s.darkBtn} onPress={async()=>{ if(baziInput){ await AsyncStorage.setItem('bazi_v1',baziInput); Alert.alert('已儲存'); }}}><Text style={s.darkBtnText}>儲存</Text></TouchableOpacity><TouchableOpacity style={[s.darkBtn,{marginTop:8}]} onPress={async()=>{ await AsyncStorage.clear(); setBaziInput(''); Alert.alert('已清除');}}><Text style={s.darkBtnText}>清除</Text></TouchableOpacity></View>
        </ScrollView>
        <View style={s.tabBar}><TouchableOpacity style={s.tab} onPress={()=>setTab('compass')}><Text style={s.tabOff}>羅盤</Text></TouchableOpacity><TouchableOpacity style={s.tab} onPress={()=>setTab('bazi')}><Text style={s.tabOff}>八字</Text></TouchableOpacity><TouchableOpacity style={[s.tab,s.tabOn]}><Text style={s.tabOnT}>設定</Text></TouchableOpacity></View>
        <View style={s.bottomAd}>{adsReady && <BannerAd unitId={IDS.banner} size={BannerAdSize.BANNER} />}</View>
      </View>
    );
  }
  if(tab==='bazi'){
    return (
      <View style={s.container}>
        <ScrollView style={{width:'100%'}} contentContainerStyle={{alignItems:'center',paddingTop:40,paddingBottom:130}}>
          <Text style={s.title}>八字參考</Text>
          <View style={[s.card,{width:'92%'}]}><TextInput style={s.input} placeholder="YYYY-MM-DD" placeholderTextColor="#666" value={baziInput} onChangeText={setBaziInput} /><TouchableOpacity style={s.goldBtn} onPress={()=>{ const r=calcBazi(baziInput); if(!r) setBaziRes({error:"格式 YYYY-MM-DD"}); else { setBaziRes(r); AsyncStorage.setItem('bazi_v1',baziInput); }}}><Text style={s.goldBtnText}>分析</Text></TouchableOpacity>{baziRes && <View style={s.unlockedBox}><Text style={s.unlockedText}>{baziRes.error||`${baziRes.full} 喜${baziRes.xi} 宜${baziRes.dir} ${baziRes.col}`}</Text></View>}</View>
          <View style={s.nativeBox}>{adsReady && <BannerAd unitId={IDS.native} size={BannerAdSize.MEDIUM_RECTANGLE} />}</View>
        </ScrollView>
        <View style={s.tabBar}><TouchableOpacity style={s.tab} onPress={()=>setTab('compass')}><Text style={s.tabOff}>羅盤</Text></TouchableOpacity><TouchableOpacity style={[s.tab,s.tabOn]}><Text style={s.tabOnT}>八字</Text></TouchableOpacity><TouchableOpacity style={s.tab} onPress={()=>setTab('settings')}><Text style={s.tabOff}>設定</Text></TouchableOpacity></View>
        <View style={s.bottomAd}>{adsReady && <BannerAd unitId={IDS.banner} size={BannerAdSize.BANNER} />}</View>
      </View>
    );
  }
  return (
    <View style={s.container}>
      <ScrollView style={{width:'100%'}} contentContainerStyle={{alignItems:'center', paddingBottom:140, paddingTop:35}}>
        <Text style={s.title}>風水佬Go {Math.round(smooth)}° {needCalib?'需校準':''}</Text><Text style={s.sub}>2026年 • {currentDir} {fly.star}{fly.name} • {currentMountain.m}山</Text>
        <View style={s.luoPanWrap}><View style={[s.luoPan, {transform:[{rotate:`${-smooth}deg`}]}]}><View style={s.luoInner}>{MOUNTAINS_24.map((m,i)=>(<View key={m} style={[s.mountainMark, {transform:[{rotate:`${i*15}deg`}, {translateY:-110}]}]}><Text style={[s.mountainText, currentMountain?.m===m && s.mountainActive]}>{m}</Text></View>))}<View style={s.centerDot}><Text style={{color:'#000',fontWeight:'bold',fontSize:12}}>{currentMountain.m}</Text></View></View><Text style={s.northMark}>北 {Math.round(smooth)}°</Text></View><View style={s.fixedNeedle}><Text style={{color:'red',fontSize:20}}>▼</Text></View></View>
        <View style={[s.card, {borderColor: fly.color}]}><Text style={[s.cardTitle, {color:fly.color}]}>{currentDir} - {fly.star} {fly.name} 財力{fly.cai}%</Text><Text style={s.cardDesc}>{fly.desc}</Text><Text style={s.mountainDetail}>坐{currentMountain.m}山 {currentMountain.deg}° {currentMountain.wu}行 {currentMountain.cai}</Text>{!unlockedCai? (<TouchableOpacity style={s.goldBtn} onPress={()=>showInter(()=>setUnlockedCai(true))}><Text style={s.goldBtnText}>查看詳細說明</Text></TouchableOpacity>) : (<View style={s.unlockedBox}><Text style={s.unlockedText}>{fly.lay} • 坐{currentMountain.m}山</Text><View style={{flexDirection:'row', marginTop:8}}><TouchableOpacity style={s.smallBtn} onPress={()=>Share.share({message:`${currentDir}${fly.name} ${fly.lay}`})}><Text style={s.smallBtnT}>分享</Text></TouchableOpacity><TouchableOpacity style={[s.smallBtn,{marginLeft:8}]} onPress={()=>setUnlockedCai(false)}><Text style={s.smallBtnT}>收起</Text></TouchableOpacity></View></View>)}</View>
        <View style={s.nativeBox}><Text style={s.adLabel}>推薦內容</Text>{adsReady && <BannerAd unitId={IDS.native} size={BannerAdSize.MEDIUM_RECTANGLE} />}</View>
      </ScrollView>
      <View style={s.tabBar}><TouchableOpacity style={[s.tab,s.tabOn]}><Text style={s.tabOnT}>羅盤</Text></TouchableOpacity><TouchableOpacity style={s.tab} onPress={()=>setTab('bazi')}><Text style={s.tabOff}>八字</Text></TouchableOpacity><TouchableOpacity style={s.tab} onPress={()=>setTab('settings')}><Text style={s.tabOff}>設定</Text></TouchableOpacity></View>
      <View style={s.bottomAd}>{adsReady && <BannerAd unitId={IDS.banner} size={BannerAdSize.BANNER} />}</View>
    </View>
  );
}
const s=StyleSheet.create({
  container:{flex:1, backgroundColor:'#0f0f0f', alignItems:'center'},
  title:{color:'#d4af37', fontSize:22, fontWeight:'bold'}, sub:{color:'#888', fontSize:12, marginTop:4},
  luoPanWrap:{width:300,height:300, alignItems:'center', justifyContent:'center', marginTop:20},
  luoPan:{width:280,height:280, borderRadius:140, borderWidth:3, borderColor:'#d4af37', backgroundColor:'#1a1a1a', alignItems:'center', justifyContent:'center'},
  luoInner:{width:220,height:220, borderRadius:110, borderWidth:1, borderColor:'#333', alignItems:'center', justifyContent:'center'},
  mountainMark:{position:'absolute', top:'50%', left:'50%', width:20, marginLeft:-10, marginTop:-10, alignItems:'center'},
  mountainText:{color:'#888', fontSize:11}, mountainActive:{color:'#000', fontWeight:'bold', fontSize:13, backgroundColor:'#d4af37', borderRadius:4, paddingHorizontal:3},
  centerDot:{width:40,height:40,borderRadius:20,backgroundColor:'#d4af37',alignItems:'center',justifyContent:'center'},
  northMark:{position:'absolute', top:-24, color:'#fff', fontSize:11}, fixedNeedle:{position:'absolute', top:0},
  card:{width:'92%', backgroundColor:'#1e1e1e', borderRadius:12, padding:14, marginTop:16, borderWidth:1, borderColor:'#333'},
  cardTitle:{fontSize:16, fontWeight:'bold'}, cardDesc:{color:'#ccc', fontSize:13, marginTop:6}, mountainDetail:{color:'#888', fontSize:11, marginTop:6},
  goldBtn:{backgroundColor:'#d4af37', padding:12, borderRadius:10, marginTop:12, alignItems:'center'}, goldBtnText:{color:'#000', fontWeight:'bold'},
  smallBtn:{backgroundColor:'#222', borderWidth:1, borderColor:'#d4af37', padding:8, borderRadius:8}, smallBtnT:{color:'#d4af37', fontSize:11},
  unlockedBox:{backgroundColor:'#2a2a2a', padding:10, borderRadius:8, marginTop:10}, unlockedText:{color:'#ddd', fontSize:13, marginTop:4},
  nativeBox:{width:'92%', backgroundColor:'#151515', borderRadius:12, padding:8, marginTop:16, alignItems:'center', minHeight:270, borderWidth:1, borderColor:'#333'},
  adLabel:{color:'#666', fontSize:10, marginBottom:4}, input:{backgroundColor:'#222', color:'#fff', padding:12, borderRadius:8, borderWidth:1, borderColor:'#333', marginTop:10},
  bottomAd:{position:'absolute', bottom:0, width:'100%', alignItems:'center', backgroundColor:'#000', height:52},
  tabBar:{position:'absolute', bottom:52, flexDirection:'row', width:'100%', backgroundColor:'#111', borderTopWidth:1, borderColor:'#222', height:50},
  tab:{flex:1, alignItems:'center', justifyContent:'center'}, tabOn:{backgroundColor:'#1e1e1e'}, tabOnT:{color:'#d4af37', fontWeight:'bold'}, tabOff:{color:'#666'},
  setCard:{width:'100%', backgroundColor:'#161616', borderRadius:12, padding:14, marginTop:12, borderWidth:1, borderColor:'#2a2a2a'},
  setT:{color:'#fff', fontSize:15, fontWeight:'bold'}, setD:{color:'#888', fontSize:12, marginTop:6, lineHeight:18},
  darkBtn:{backgroundColor:'#222', borderWidth:1, borderColor:'#d4af37', padding:12, borderRadius:10, marginTop:10, alignItems:'center'}, darkBtnText:{color:'#d4af37', fontWeight:'bold'},
});
