// deno.landに公開されているモジュールをimport
// denoではURLを直に記載してimportできます
import { serveDir } from "https://deno.land/std@0.223.0/http/file_server.ts";

// 直前の単語を保持しておく
let previousWord = "しりとり";

// localhostにDenoのHTTPサーバーを展開
Deno.serve(async (request) => {
  // パス名を取得する
  // http://localhost:8000/hoge に接続した場合"/hoge"が取得できる
  const pathname = new URL(request.url).pathname;
  console.log(`pathname: ${pathname}`);

  // GET /shiritori: 直前の単語を返す
  if (request.method === "GET" && pathname === "/shiritori") {
    return new Response(previousWord);
  }

  // POST /shiritori: 次の単語を入力する
  if (request.method === "POST" && pathname === "/shiritori") {
    // リクエストのペイロードを取得
    const requestJson = await request.json();
    // JSONの中からnextWordを取得
    const nextWord = requestJson["nextWord"];

    // previousWordの末尾とnextWordの先頭が同一か確認
    if (
      previousWord.slice(-1) === nextWord.slice(0, 1) ||
      previousWord.slice(-1) === hiraToKana(nextWord.slice(0, 1)) ||
      previousWord.slice(-1) === kanaToHira(nextWord.slice(0, 1))
    ) {
      // 同一であれば、previousWordを更新
      previousWord = nextWord;
    }
    // 同一でない単語の入力時に、エラーを返す
    else {
      return new Response(
        JSON.stringify({
          errorMessage: "前の単語に続いていません",
          errorCode: "10001",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json; charset=utf-8" },
        }
      );
    }

    // 現在の単語を返す
    return new Response(previousWord);
  }

  // ./public以下のファイルを公開
  return serveDir(request, {
    /*
            - fsRoot: 公開するフォルダを指定
            - urlRoot: フォルダを展開するURLを指定。今回はlocalhost:8000/に直に展開する
            - enableCors: CORSの設定を付加するか
            */
    fsRoot: "./public/",
    urlRoot: "",
    enableCors: true,
  });
});

function kanaToHira(str) {
  return str.replace(/[u30a1-\u30f6]/g, function (match) {
    const chr = match.charCodeAt(0) - 0x60;
    return String.fromCharCode(chr);
  });
}

function hiraToKana(str) {
  return str.replace(/[u3041-\u3096]/g, function (match) {
    const chr = match.charCodeAt(0) + 0x60;
    return String.fromCharCode(chr);
  });
}
