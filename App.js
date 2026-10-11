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
  "正北": {star:"一白", name:"偏財位", cai:95, color:"#D4AF37", good:true, desc:"2026一白入正北，最大偏財", lay:"正北放一杯清水+6硬幣，養黑魚，錢包向北。"},
  "東北": {star:"八白", name:"正財帝位", cai:99, color:"#FFD700", good:true, desc:"2026八白最旺，正財帝王位", lay:"東北放黃水晶聚寶盆+五帝錢，保險箱放此位。"},
  "正東": {star:"三碧", name:"是非位", cai:20, color:"#FF6B6B", good:false, desc:"三碧是非，易有合約破財", lay:"放紅地氈+紅燈，忌魚缸。"},
  "東南": {star:"四綠", name:"文昌位", cai:82, color:"#51CF66", good:true, desc:"文昌利考試寫作流量", lay:"四枝富貴竹+文昌塔放東南。"},
  "正南": {star:"九紫", name:"喜慶位", cai:90, color:"#FF69B4", good:true, desc:"九紫喜慶，人緣財", lay:"9枝紅花+紅燈放正南。"},
  "西南": {star:"二黑", name:"病符位", cai:15, color:"#888", good:false, desc:"二黑病符注意健康破財", lay:"銅葫蘆+五帝錢。"},
  "正西": {star:"七赤", name:"破財位", cai:25, color:"#FF8E53", good:false, desc:"七赤易被盜騙", lay:"一杯清水+藍地氈。"},
  "西北": {star:"六白", name:"貴人位", cai:88, color:"#D4AF37", good:true, desc:"六白貴人帶財", lay:"金屬風鈴+六帝錢放西北。"},
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
    const lucky={木:{el:"火",dir:"正南",col:"紅紫色"},火:{el:"土",dir:"西南",col:"黃色"},土:{el:"金",dir:"正西",col:"白金色"},金:{el:"水",dir:"正北",col:"黑藍色"},水:{el:"木",dir:"正東",col:"綠色"}};
    return {full:`${y}年 ${yearStem}命 日主${dayStem}`, five, xi:weak,...lucky[weak]};
  }catch{ return null; }
}

export default function App(){
  const [tab,setTab]=useState('compass');
  const [heading,setHeading]=useState(0); const [smooth,setSmooth]=useState(0);
  const [raw,setRaw]=useState({x:0,y:0,z:0});
  const [adsReady,setAdsReady]=useState(false); const [interReady,setInterReady]=useState(false);
  const [baziInput,setBaziInput]=useState(''); const [baziRes,setBaziRes]=useState(null);
  const [unlockedCai,setUnlockedCai]=useState(false); const [needCalib,setNeedCalib]=useState(false); const [lastInter,setLastInter]=useState(0);
  const interRef=useRef(null); const lastRaw=useRef(0);
  const acc=useRef({x:0,y:0,z:9.81}); const magF=useRef({x:0,y:0,z:0});

  useEffect(()=>{
    let mSub,aSub;
    (async()=>{
      const ok=await Magnetometer.isAvailableAsync(); if(!ok){ setNeedCalib(true); return; }
      await Magnetometer.setUpdateIntervalAsync(100);
      await Accelerometer.setUpdateIntervalAsync(100);
      aSub=Accelerometer.addListener(d=>{ acc.current=d; });
      mSub=Magnetometer.addListener(d=>{
        // 快起步，不過濾頭一下
        if(magF.current.x===0&&
