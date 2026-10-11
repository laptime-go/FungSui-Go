import React, { useState, useEffect, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert, Share, Vibration } from 'react-native';
import { Magnetometer, Accelerometer } from 'expo-sensors';
import mobileAds, { BannerAd, BannerAdSize, InterstitialAd, AdEventType, AppOpenAd } from 'react-native-google-mobile-ads';
import AsyncStorage from '@react-native-async-storage/async-storage';

const IDS = {
  banner: "ca-app-pub-9890149028563226/7565306387",
  inter: "ca-app-pub-9890149028563226/5859110495",
  appopen: "ca-app-pub-9890149028563226/1285440667",
  native: "ca-app-pub-9890149028563226/9108090368"
};
const MOUNTAINS = ["壬","子","癸","丑","艮","寅","甲","卯","乙","辰","巽","巳","丙","午","丁","未","坤","申","庚","酉","辛","戌","乾","亥"];
const MOUNTAIN_DATA = [
  {m:"壬",deg:"337.5-352.5",gua:"坎",wu:"水",cai:"偏財水"}, {m:"子",deg:"352.5-7.5",gua:"坎",wu:"水",cai:"正財旺"},
  {m:"癸",deg:"7.5-22.5",gua:"坎",wu:"水",cai:"橫財"}, {m:"丑",deg:"22.5-37.5",gua:"艮",wu:"土",cai:"財庫"},
  {m:"艮",deg:"37.5-52.5",gua:"艮",wu:"土",cai:"地產財"}, {m:"寅",deg:"52.5-67.5",gua:"艮",wu:"木",cai:"創業財"},
  {m:"甲",deg:"67.5-82.5",gua:"震",wu:"木",cai:"偏門財"}, {m:"卯",deg:"82.5-97.5",gua:"震",wu:"木",cai:"正財"},
  {m:"乙",deg:"97.5-112.5",gua:"震",wu:"木",cai:"小財"}, {m:"辰",deg:"112.5-127.5",gua:"巽",wu:"土",cai:"印鈔庫"},
  {m:"巽",deg:"127.5-142.5",gua:"巽",wu:"木",cai:"文昌財"}, {m:"巳",deg:"142.5-157.5",gua:"巽",wu:"火",cai:"快錢"},
  {m:"丙",deg:"157.5-172.5",gua:"離",wu:"火",cai:"名氣財"}, {m:"午",deg:"172.5-187.5",gua:"離",wu:"火",cai:"旺財"},
  {m:"丁",deg:"187.5-202.5",gua:"離",wu:"火",cai:"暗財"}, {m:"未",deg:"202.5-217.5",gua:"坤",wu:"土",cai:"田宅財"},
  {m:"坤",deg:"217.5-232.5",gua:"坤",wu:"土",cai:"印鈔位"}, {m:"申",deg:"232.5-247.5",gua:"坤",wu:"金",cai:"貴人財"},
  {m:"庚",deg:"247.5-262.5",gua:"兌",wu:"金",cai:"武財"}, {m:"酉",deg:"262.5-277.5",gua:"兌",wu:"金",cai:"兌現財"},
  {m:"辛",deg:"277.5-292.5",gua:"兌",wu:"金",cai:"珠寶財"}, {m:"戌",deg:"292.5-307.5",gua:"乾",wu:"土",cai:"大財庫"},
  {m:"乾",deg:"307.5-322.5",gua:"乾",wu:"金",cai:"天財"}, {m:"亥",deg:"322.5-337.5",gua:"乾",wu:"水",cai:"長線財"},
];
const FLY_2026 = {
  "正北": {star:"一白貪狼", name:"偏財位", cai:95, color:"#D4AF37", desc:"2026一白入坎，最大偏財位", lay:"印鈔機佈局：正北放一杯清水+6枚硬幣，養一條金魚。每日向北數錢3次，催偏財。避紅色。", kou:"水為財，北為印鈔機"},
  "東北": {star:"八白左輔", name:"正財帝位", cai:99, color:"#FFD700", desc:"八白當令，正財帝王位", lay:"印鈔機佈局：東北放黃水晶聚寶盆+五帝錢，保險箱放此位。2026最旺，開門見財。", kou:"東北開，黃金來"},
  "正東": {star:"三碧祿存", name:"是非破財", cai:20, color:"#FF6B6B", desc:"三碧是非，小心合約破財", lay:"化解：放紅地氈+紅燈，文件用紅色資料夾。唔好放魚缸。", kou:"東邊紅，是非空"},
  "東南": {star:"四綠文曲", name:"文昌財", cai:80, color:"#51CF66", desc:"利考試、文案、流量變現", lay:"印鈔機佈局：四支富貴竹+文昌塔，直播/寫作向東南，流量=錢。", kou:"東南筆，寫出銀"},
  "正南": {star:"九紫右弼", name:"喜慶財", cai:90, color:"#FF69B4", desc:"九紫喜慶，人緣變現", lay:"印鈔機佈局：9枝紅玫瑰+紅色燈，適合做喜事生意、直播帶貨，粉絲即錢。", kou:"南邊喜，錢自來"},
  "西南": {star:"二黑巨門", name:"病符破財", cai:15, color:"#888", desc:"二黑病符，注意醫療破財", lay:"化解：銅葫蘆+六帝錢，保持乾淨唔堆雜物，唔好訓此位。", kou:"西南淨，保住錢"},
  "正西": {star:"七赤破軍", name:"破財口舌", cai:25, color:"#FF8E53", desc:"七赤口舌，易被偷呃", lay:"化解：一杯清水+藍色地氈，唔好放利器，錢包唔放西。", kou:"西邊水，擋小人"},
  "西北": {star:"六白武曲", name:"貴人正財", cai:85, color:"#D4AF37", desc:"六白武曲，貴人帶財", lay:"印鈔機佈局：金屬風鈴+六帝錢，男主人向西北坐，談生意必成。", kou:"西北金，貴人臨"},
};

function calcBazi(dStr){
  try{
    const d=new Date(dStr); if(isNaN(d)) return null;
    const stems=["甲","乙","丙","丁","戊","己","庚","辛","壬","癸"];
    const y=d.getFullYear(); const day=d.getDate();
    const yearStem=stems[(y-4)%10]; const dayStem=stems[(y+day)%10];
    const map={甲:"木",乙:"木",丙:"火",丁:"火",戊:"土",己:"土",庚:"金",辛:"金",壬:"水",癸:"水"};
    const five={木:1,火:1,土:1,金:1,水:1}; five[map[yearStem]]++; five[map[dayStem]]++;
    const weak=Object.entries(five).sort((a,b)=>a[1]-b[1])[0][0];
    const lucky={木:{el:"火",dir:"正南",col:"紅紫色",num:"2,7",tip:"南邊擺發財燈"},火:{el:"土",dir:"西南",col:"黃色",num:"5,0",tip:"黃水晶招財"},土:{el:"金",dir:"正西",col:"白色金色",num:"4,9",tip:"保險箱放西"},金:{el:"水",dir:"正北",col:"黑色藍色",num:"1,6",tip:"北邊放水"},水:{el:"木",dir:"正東",col:"綠色",num:"3,8",tip:"東邊種發財樹"}};
    return {full:`${y}年 ${yearStem}命 日主${dayStem}`, five, xi:weak,...lucky[weak]};
  }catch{return null;}
}

export default function App(){
  const [tab,setTab]=useState('compass');
  const [heading,setHeading]=useState(0); const [smooth,setSmooth]=useState(0);
  const [adsReady,setAdsReady]=useState(false); const [baziInput,setBaziInput]=useState(''); const [baziRes,setBaziRes]=useState(null);
  const [unlocked,setUnlocked]=useState(false); const [needCalib,setNeedCalib]=useState(false);
  const lastRaw=useRef(0); const acc=useRef({x:0,y:0,z:9.81}); const magF=useRef({x:0,y:0,z:0});
  const interRef=useRef(null);

  useEffect(()=>{
    let mSub,aSub; let first=true;
    (async()=>{
      await Magnetometer.setUpdateIntervalAsync(50); await Accelerometer.setUpdateIntervalAsync(50);
      aSub=Accelerometer.addListener(v=>acc.current=v);
      mSub=Magnetometer.addListener(v=>{
        if(first){ magF.current=v; first=false; } else { magF.current.x=magF.current.x*0.75+v.x*0.25; magF.current.y=magF.current.y*0.75+v.y*0.25; magF.current.z=magF.current.z*0.75+v.z*0.25; }
        const {x,y,z}=magF.current; const {x:ax,y:ay,z:az}=acc.current;
        let angle;
        if(Math.abs(az)>0.5){
          const roll=Math.atan2(ay,az); const pitch=Math.atan2(-ax, Math.hypot(ay,az));
          const mx=x*Math.cos(pitch)+z*Math.sin(pitch);
          const my=x*Math.sin(roll)*Math.sin(pitch)+y*Math.cos(roll)-z*Math.sin(roll)*Math.cos(pitch);
          angle=Math.atan2(-my,mx)*180/Math.PI;
        } else { angle=Math.atan2(y,x)*180/Math.PI; }
        angle=(angle+360)%360;
        setNeedCalib(Math.hypot(x,y,z)<18||Math.hypot(x,y,z)>85);
        let diff=angle-lastRaw.current; if(diff>180) diff-=360; if(diff<-180) diff+=360;
        lastRaw.current=(lastRaw.current+diff*0.35+360)%360; setHeading(lastRaw.current);
      });
      const s=await AsyncStorage.getItem('bazi_v1'); if(s) setBaziInput(s);
    })(); return()=>{mSub?.remove(); aSub?.remove();};
  },[]);
  useEffect(()=>{ const t=setInterval(()=>{ let d=heading-smooth; if(d>180)d-=360; if(d<-180)d+=360; if(Math.abs(d)>0.01) setSmooth(v=>(v+d*0.2+360)%360); },16); return()=>clearInterval(t); },[heading,smooth]);

  useEffect(()=>{ setTimeout(async()=>{ try{ await mobileAds().initialize(); setAdsReady(true); const inter=InterstitialAd.createForAdRequest(IDS.inter,{requestNonPersonalizedAdsOnly:true}); interRef.current=inter; inter.load(); inter.addAdEventListener(AdEventType.CLOSED,()=>inter.load()); AppOpenAd.createForAdRequest(IDS.appopen,{requestNonPersonalizedAdsOnly:true}).load(); }catch{} },800); },[]);

  const idx=Math.floor((smooth+7.5)/15)%24; const mountain=MOUNTAIN_DATA[idx];
  const dirs=["正北","東北","正東","東南","正南","西南","正西","西北"]; const dir=dirs[Math.round(smooth/45)%8]; const fly=FLY_2026[dir];

  const showCai=()=>{
    Alert.alert("印鈔佈局","即將播放廣告，睇完解鎖詳細催財法 (可跳過)",[
      {text:"取消", style:"cancel"},
      {text:"睇廣告解鎖", onPress:()=>{ if(interRef.current){ interRef.current.show().catch(()=>setUnlocked(true)); const u=interRef.current.addAdEventListener(AdEventType.CLOSED,()=>{setUnlocked(true); u();}); } else setUnlocked(true); }}
    ]);
  };

  return (
    <View style={s.container}>
      <ScrollView style={{width:'100%'}} contentContainerStyle={{alignItems:'center', paddingBottom:140, paddingTop:30}}>
        <Text style={s.title}>風水佬Go {Math.round(smooth)}° {needCalib?'⚠️搖一搖校準':''}</Text>
        <Text style={s.sub}>2026 • {dir} {fly.star} 財力{fly.cai}% • {mountain.m}山 {mountain.gua} {mountain.cai}</Text>

        <View style={s.luoPanWrap}>
          <View style={[s.luoPan, {transform:[{rotate:`${-smooth}deg`}]}]}>
            <View style={s.luoInner}>
              {MOUNTAINS.map((m,i)=>(<View key={m} style={[s.mark, {transform:[{rotate:`${i*15}deg`},{translateY:-108}]}]}><Text style={[s.markT, mountain.m===m && s.markOn]}>{m}</Text></View>))}
              <View style={s.center}><Text style={{fontWeight:'900', color:'#000'}}>{mountain.m}</Text><Text style={{fontSize:8, color:'#000'}}>{Math.round(smooth)}°</Text></View>
            </View>
          </View>
          <View style={s.arrow}><Text style={{color:'red',fontSize:20}}>▼</Text></View>
        </View>

        <View style={[s.card,{borderColor:fly.color, borderWidth:1.5}]}>
          <View style={{flexDirection:'row', justifyContent:'space-between'}}><Text style={[s.cardTitle,{color:fly.color}]}>{dir} {fly.name} 財力{fly.cai}%</Text><Text style={{color:fly.color}}>{fly.star}</Text></View>
          <Text style={s.cardDesc}>{fly.desc} - {mountain.deg}° {mountain.cai}</Text>
          <Text style={s.kou}>口訣：{fly.kou}</Text>
          {!unlocked? (
            <TouchableOpacity style={s.goldBtn} onPress={showCai}><Text style={s.goldBtnText}>▶ 查看印鈔佈局 (將播放廣告)</Text></TouchableOpacity>
          ) : (
            <View style={s.unlocked}><Text style={s.unlockedT}>{fly.lay}{"\n"}坐{mountain.m}山：{mountain.gua}卦屬{mountain.deg}°，{mountain.cai}。{"\n"}催財：{fly.kou}</Text>
              <View style={{flexDirection:'row', marginTop:8}}><TouchableOpacity style={s.smallBtn} onPress={()=>{Vibration.vibrate(50); Share.share({message:`${dir}${fly.name}佈局：${fly.lay} - 風水佬Go`});}}><Text style={s.smallBtnT}>分享佈局</Text></TouchableOpacity></View>
            </View>
          )}
        </View>

        <View style={[s.card,{width:'92%'}]}>
          <Text style={s.cardTitle}>今日財神位 {baziRes?`喜${baziRes.xi} ${baziRes.dir}`:'輸入生日解鎖'}</Text>
          <View style={{flexDirection:'row', marginTop:8}}><TextInput style={[s.input,{flex:1}]} placeholder="YYYY-MM-DD" placeholderTextColor="#666" value={baziInput} onChangeText={setBaziInput}/><TouchableOpacity style={[s.goldBtn,{marginTop:0, marginLeft:8, paddingHorizontal:16}]} onPress={()=>{ const r=calcBazi(baziInput); if(!r) Alert.alert("格式錯誤"); else { setBaziRes(r); AsyncStorage.setItem('bazi_v1',baziInput);} }}><Text style={s.goldBtnText}>算</Text></TouchableOpacity></View>
          {baziRes && <View style={s.unlocked}><Text style={s.unlockedT}>{baziRes.full} 五行{JSON.stringify(baziRes.five)} {"\n"}喜用神：{baziRes.xi} 催財：{baziRes.el} {"\n"}幸運方位：{baziRes.dir} 顏色：{baziRes.col} 號碼：{baziRes.num} {"\n"}秘訣：{baziRes.tip}</Text></View>}
        </View>

        <View style={s.nativeBox}><Text style={s.adLabel}>推薦</Text>{adsReady && <BannerAd unitId={IDS.native} size={BannerAdSize.MEDIUM_RECTANGLE} />}</View>
        <Text style={{color:'#333', fontSize:9, marginTop:10}}>無敵印鈔機版 • 羅盤已修復會轉 • 僅供參考</Text>
      </ScrollView>
      <View style={s.tabBar}><TouchableOpacity style={[s.tab,s.tabOn]}><Text style={s.tabOnT}>羅盤印鈔</Text></TouchableOpacity><TouchableOpacity style={s.tab} onPress={()=>Alert.alert("已在羅盤頁","八字在上方輸入")}><Text style={s.tabOff}>八字</Text></TouchableOpacity><TouchableOpacity style={s.tab} onPress={()=>Alert.alert("校準","平放手機畫8字")}><Text style={s.tabOff}>設定</Text></TouchableOpacity></View>
      <View style={s.bottomAd}>{adsReady && <BannerAd unitId={IDS.banner} size={BannerAdSize.BANNER} />}</View>
    </View>
  );
}
const s=StyleSheet.create({
  container:{flex:1, backgroundColor:'#0a0a0a', alignItems:'center'},
  title:{color:'#D4AF37', fontSize:20, fontWeight:'900'}, sub:{color:'#888', fontSize:11, marginTop:2},
  luoPanWrap:{width:300,height:300, alignItems:'center', justifyContent:'center', marginTop:14},
  luoPan:{width:276,height:276, borderRadius:138, borderWidth:3, borderColor:'#D4AF37', backgroundColor:'#151515', alignItems:'center', justifyContent:'center'},
  luoInner:{width:220,height:220, borderRadius:110, borderWidth:1, borderColor:'#333', alignItems:'center', justifyContent:'center'},
  mark:{position:'absolute', top:'50%', left:'50%', width:18, marginLeft:-9, marginTop:-9, alignItems:'center'},
  markT:{color:'#777', fontSize:11}, markOn:{color:'#000', backgroundColor:'#D4AF37', borderRadius:4, paddingHorizontal:3, fontWeight:'900'},
  center:{width:48,height:48,borderRadius:24,backgroundColor:'#D4AF37',alignItems:'center',justifyContent:'center'},
  arrow:{position:'absolute', top:-2}, card:{width:'92%', backgroundColor:'#1c1c1c', borderRadius:12, padding:12, marginTop:12, borderWidth:1, borderColor:'#2a2a2a'},
  cardTitle:{color:'#D4AF37', fontSize:15, fontWeight:'900'}, cardDesc:{color:'#ccc', fontSize:12, marginTop:4}, kou:{color:'#D4AF37', fontSize:11, marginTop:4, fontStyle:'italic'},
  goldBtn:{backgroundColor:'#D4AF37', padding:12, borderRadius:10, marginTop:10, alignItems:'center'}, goldBtnText:{color:'#000', fontWeight:'900', fontSize:13},
  smallBtn:{backgroundColor:'#222', borderWidth:1, borderColor:'#D4AF37', padding:8, borderRadius:8, marginRight:8}, smallBtnT:{color:'#D4AF37', fontSize:11},
  unlocked:{backgroundColor:'#252525', padding:10, borderRadius:8, marginTop:8}, unlockedT:{color:'#ddd', fontSize:12, lineHeight:18},
  input:{backgroundColor:'#222', color:'#fff', padding:10, borderRadius:8, borderWidth:1, borderColor:'#333'},
  nativeBox:{width:'92%', backgroundColor:'#151515', borderRadius:12, padding:6, marginTop:12, alignItems:'center', minHeight:260, borderWidth:1, borderColor:'#2a2a2a'},
  adLabel:{color:'#555', fontSize:9}, bottomAd:{position:'absolute', bottom:0, width:'100%', alignItems:'center', backgroundColor:'#000', height:52},
  tabBar:{position:'absolute', bottom:52, flexDirection:'row', width:'100%', backgroundColor:'#111', borderTopWidth:1, borderColor:'#222', height:48},
  tab:{flex:1, alignItems:'center', justifyContent:'center'}, tabOn:{backgroundColor:'#1e1e1e'}, tabOnT:{color:'#D4AF37', fontWeight:'900'}, tabOff:{color:'#666', fontSize:12},
});
