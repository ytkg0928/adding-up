'use strict';
//モジュール呼び出し

//fs FileSystem　の略　ファイルを扱うモジュール
const fs = require('fs');

//readline ファイルを一行ずつ読み込むためのモジュール
const readline = require('readline');

// popu-pref.csv ファイルから、ファイルを読み込みを行う Stream を生成し、
// さらにそれを readline オブジェクトの input として設定し、
//  rl オブジェクトを作成しています。
// Stream とは、非同期で情報を取り扱うための概念で、情報自体ではなく情報の流れに注目します。

const rs = fs.ReadStream('./popu-pref.csv');
const rl = readline.createInterface({ 'input': rs, 'output': {} });
const prefectureDataMap = new Map(); // key: 都道府県 value: 集計データのオブジェクト

//このコードは、rl オブジェクトで line というイベントが発生したらこの無名関数を呼んでください、という意味です。
rl.on('line', (lineString) => {
    //この行は、引数 lineString で与えられた文字列をカンマ , で分割して、それを columns という配列にしています。
//たとえば、"ab,cde,f" という文字列であれば、["ab", "cde", "f"]という文字列からなる配列に分割されます。
    const columns = lineString.split(',');
  
//     ちなみに、parseInt() は、文字列を整数値に変換する関数です。
// そもそも lineString.split() は、文字列を対象とした関数なので、結果も文字列の配列になっています。
// しかし、集計年や 15〜19 歳の人口はもともと数値なので、文字列のままだとのちのち数値と比較したときなどに
// 不都合が生じます。そこで、これらの変数を文字列から数値に変換するために、parseInt() を使っているのです。
    const year = parseInt(columns[0]);
    const prefecture = columns[2];
    const popu = parseInt(columns[7]);

//     集計年の数値 year が、 2010 または 2015 である時を if 文で判定しています。
// 2010 年または 2015 年のデータのみが、コンソールに出力されることになります。
    if (year === 2010 || year === 2015) {
        let value = prefectureDataMap.get(prefecture);
        if (!value) {
            value = {
                popu10: 0,
                popu15: 0,
                change: null
            };
        }
        if (year === 2010) {
            value.popu10 += popu;
        }
        if (year === 2015) {
            value.popu15 += popu;
        }
        prefectureDataMap.set(prefecture, value);
    }
});

// これは for-of 構文といいます。
// Map や Array の中身を of の前に与えられた変数に代入して for ループと同じことができます。
// 配列に含まれる要素を使いたいだけで、添字は不要な場合に便利です。

rl.on('close', () => {
    for (let [key, value] of prefectureDataMap) { 
        value.change = value.popu15 / value.popu10;
    }

//     Array.from( ) メソッドを用いれば、配列に似た型のもの（ここでは Map ）を普通の配列に変換することができます。
// prefectureDataMap は 次のようなデータを格納する目的で作成された連想配列です。
// const prefectureDataMap = new Map(); // key: 都道府県 value: 集計データのオブジェクト
// 各都道府県名のkey と 各集計データオブジェクトのvalue の対といえます。
// この連想配列 prefectureDataMap を引数に、Array.from(prefectureDataMap) を呼び出すと、
//  key と value の対を配列とし、その配列を要素とした配列（ペア配列の配列）に変換されます。

    const rankingArray = Array.from(prefectureDataMap).sort((pair1, pair2) => {
        return pair2[1].change - pair1[1].change;
    });
    const rankingStrings = rankingArray.map(([key, value]) => {
        return key + ': ' + value.popu10 + '=>' + value.popu15 + ' 変化率:' + value.change;
    });
    console.log(rankingStrings);
});