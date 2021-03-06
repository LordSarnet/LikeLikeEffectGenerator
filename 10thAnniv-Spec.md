 10周年記念仕様いいねボタン風EAG 仕様
======================================

## やりたいこと

* まずはそれっぽいものを再現
* パーティクルの画像も差し替えられるようにする

## 解析

* パーティクル
    * 星(3軸回転、色も変わってる？、消滅時拡大率1軸に対し0)
    * 正方形(3軸回転、消滅時拡大率1軸に対し0)
    * 扇型( **1軸** 回転、表示角度の大きさが変わる(変わる速度も一定でない)、消滅時にポップエフェクト)
    * ドーナツ(通常仕様のポップエフェクトみたいなやつ)
    * 正円(消滅時単純縮小)
    * 三角形(3軸回転、消滅時拡大率1軸に対し0)
* パーティクルに対する単純な物理演算
    * 重力(下向き定数値の力)
    * 空気抵抗(速度に比例する抵抗力)
* 登場エフェクト
    * 8方向に線分(ポップエフェクト)
        * 移動しながら伸びて消える
        * 始点と終点の座標変化をずらして実現
        * 始点は速く2乗に比例して最終座標に移動、終点は遅く線形に最終座標に移動
    * 多分色はまた虹色
        * と思ったら、1つの直線上に乗ってる線分は同じ色
        * 色はバラバラなので、虹色で近似してしまって良いと思われる
    * ハートマークは単純に跳ねるだけ(y座標が二乗に比例)
        * じゃない！！！！
        * 着地時にちょっとオーバーシュートする(下に凸の2次関数をくっつければ良いと思われる)

## パーティクルエンジン

### 単純物理演算
パーティクルの **位置のみ** を決定する。

* 鉛直方向の計算式は以下の通り
    * 速度モデル : vy = (v0y - gn / k) e^(-kt) + gn / k (g : 鉛直下方向重力定数(正値), k : 空気抵抗定数, v0y : 初速度, gn := -g)
    * **位置モデル** : y = - ((k v0y - gn) / k^2) e^(-kt) + gn/k t + (y0 + ((k v0y - gn) / k^2))
    * == y = - ((k v0y + g) / k^2) e^(-kt) - g/k t + (y0 + (k v0y + g) / k^2) (y0 : 初期位置)
    * **y0** はハート出現位置で固定(一応パーティクルオブジェクトで指定)
    * g は、直接決めるのではなく、最終的な落下速度 **vly** の値を用いて、**g = - k vly** で決定する
    * **vly, k** はパーティクルエンジン内で決める
    * **v0y** はパーティクル1個毎に決める
* 水平方向の計算式は以下の通り
    * 速度モデル : vx = (v0x) e^(-kt) (v0x : 初速度, k : 空気抵抗定数)
    * **位置モデル** : x = - (v0x / k) e^(-kt) + x0 + v0x / k (x0 : 初期位置)
    * **x0** はハート出現位置で固定(一応パーティクルオブジェクトで指定)
    * **k** はパーティクルエンジン内で決める(一応、XとY軸で別々に設定できるようにした方が良いかも)
    * **v0x** はパーティクル1個毎に決める

### パーティクルオブジェクト
パーティクルの"挙動"を決定し、その"挙動"から実際のSVGツリー構造を返却するメソッドを持つオブジェクト

* 基底クラス `ParticleBase`
    * protected getBaseXY(t: number) -> { x: number, y: number } : 上記の単純物理演算を、オブジェクトに設定された初速度・初期位置を用いて実行し、XY座標を含む基礎座標を返却する
    * abstract public generateSVGTree(t: number) -> <SVG g Element> : 後述のルールに従うSVGグループノードを生成し、返却する(抽象メソッド、これを継承する各子クラスで実装)
    * protected v0X, v0Y: number : 初速度(sip/s)
    * protected x0, y0: number : 初期位置(sip)
    * private kX, kY: number : 空気抵抗定数(一応XY軸で別々に設定できるようにする)
    * private vLastY: number : 最終落下速度(sip/s)
    * private g: number : 重力定数(= -k × vly) (sip/s^2)
    * protected size: number : パーティクルのサイズ(半径の長さで指定)(sip)
    * protected lifeTime: number : 寿命(s)
    * protected disappearDurationRate: number : lifeTimeに対する消失に使用される時間の割合([0,1])
    * protected color: { r,g,b: number } : 色(それぞれ8bit整数値で指定)
* 星のパーティクルクラス `PStar`
    * private vSpinZ, vSpinX, vSpinY: number : ZXY軸に関する回転速度(360deg/s, 1.0で360度/secになる)
    * private initSpinZ: number : 初期Z軸回転角度(360deg)
    * 星形のパス、3軸回転、消滅時X軸拡大率0 を再現
* 正方形のパーティクルクラス `PSquare`
    * private vSpinZ, vSpinX, vSpinY: number : ZXY軸に関する回転速度(360deg/s)
    * private initSpinZ: number : 初期Z軸回転角度(360deg/s)
    * 正方形のパス、3軸回転、消滅時X軸拡大率0 を再現
* 三角形のパーティクルクラス `PTriangle`
    * private vSpinZ, vSpinX, vSpinY: number : ZXY軸に関する回転速度(360deg/s)
    * private initSpinZ: number : 初期Z軸回転角度(360deg/s)
    * 正三角形のパス、3軸回転、消滅時X軸拡大率0 を再現
* 正円のパーティクルクラス `PCircle`
    * 正円のパス、消滅時単純拡大率0 を再現
* ポップサークルのパーティクルクラス `PPopCircle`
    * 通常仕様のポップサークルと同じ(但し、lifeTime, disappearDurationRate に対応)
* リボンのパーティクルクラス `PRibbon`
    * private vSpinZ: number : Z軸に関する回転速度(360deg/s)
    * private initSpinZ: number : 初期Z軸回転角度(360deg/s)
    * private lineWidth: number : 線幅(sip)
    * private PopLineEffectInstance: PopLineEffect : ポップエフェクトオブジェクトのインスタンス
    * 扇型のパス を再現(データ内容は多分次の通り)
        * …と思ったけど、これもしかして 単なる円弧＋端形状丸＋線幅太め で良いのでは？
        * 資料をよく見るとどうも端形状は丸になっているので、これを全部パスで表現するのは相当キツい
        * ということは、データ内容は以下で良い
        * M <円弧始点X>,<円弧始点Y>
        * A <中心半径>,<中心半径> 0 0,1 <円弧終点X>,<円弧終点Y>
        * あとはストロークと色を指定すれば良い
    * 終点座標の基礎角度は PI / 3
    * 消滅時間中に始点座標の基礎角度を 0 〜 PI / 3(よりわずかに小さい値) で動かす
    * 寿命が過ぎた後、その 寿命〜寿命＋popDuration までの間でポップエフェクトを再現
    * ポップエフェクトの仕様は、いいねボタンを押した時のポップエフェクトと全く同様なので、それを再利用する
        * ポップエフェクトの表示場所は、寿命が過ぎた瞬間の座標を固定で使用する
    * Z軸回転を再現

### ポップエフェクト
いいねボタンを押した時に出現画像を中心に出現する、広がる8本の線を再現する関数。

* generatePopEffectSVGTree(t: number, size: number) -> <SVG g Element>
    * 内部定数
        * duration: number : 消滅までの時間(sec)
        * OuterStartRadiusRate : 線分の終点をどの半径の円上から開始するかを、sizeに対する割合で指定([0,1])
        * lineWidthFactor : sizeに対する線分の太さの割合
    * 引数
        * t: number : 該当フレームの時刻(sec)
        * size: number : 大きさ(消滅時の半径で指定)
    * 始点は2次関数、終点は1次関数で動かす


## SVG出力時のルール

* viewport
    * x : -50, 50 (w : 100)
    * y : -80, 20 (h : 100) *座標系が右手系でないことに注意*
* 単位はsip(scale independent pixels)
* 最終的にcanvasへ描画する直前までは、このviewportの座標範囲で描画を行う
* 生成サイズ(短辺指定) / w の倍率で拡大する(最終的に生成されたSVGノード群をグループ化して、`transform="scale(<m>,<m>)"`属性を付与)
    * もしかしたら、viewBoxを上のviewportの通りに指定した上で、width/height を適切に設定すれば、それだけでうまく行くかも？
* 出現画像は、上記viewport上で ([-18,18], [-18,18]) に収まるように配置
* 回転は、Z軸方向に関しては`transform="rotate(<r>)"`、XY軸方向に関しては`transform="scale(<cos(ry),cos(rx)>)"`で表現
* 時間はフレーム単位ではなく実時間(sec)で表現し、実際の出力時は 1 / フレームレート の間隔でSVGを取得し、それを各フレームの内容とする。


## 追加の依存スクリプト

今回ちょっと物量が前回より遥かに多いので、SVGツリーの生成には [SVG.JS](http://svgjs.com/) を利用する。
