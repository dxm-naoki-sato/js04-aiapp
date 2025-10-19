// ★忘れずに！ js/config.js に APIキーを設定する

// APIキーの情報を読み込む
import { GEMINI_API_KEY } from './config.js';
// @google/genai ライブラリを読み込む
import { GoogleGenAI } from 'https://cdn.jsdelivr.net/npm/@google/genai';

// @google/genai ライブラリを初期化ｓ
const genAI = new GoogleGenAI({ apiKey: GEMINI_API_KEY });




// 検索キーワードを取得する
$(document).ready(function() {
 
    $('#send').on('click', function() {
          
        const textValue = $('#user-input').val();
        console.log('入力値:', textValue);
        
        if (!textValue) {
            alert('検索キーワードを入力してください');
            return;
        }
        
        $('#response').html('検索中...');
        
        // searchBooks関数を呼び出す
        searchBooks(textValue);
    });

    // クリアボタン
    $('#clear').on('click', function () {
        console.log('=== クリアボタンクリック検知 ===');
        alert('クリアボタンが正常にクリックされました！');
        $('#response').html('');
        $('#user-input').val('');
    });
});


// 書籍の検索　GoogleAPIを利用した（アカウント登録不要）
async function searchBooks(textValue) {
    console.log('書籍検索開始:', textValue);
    
    try {
        const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(textValue)}&maxResults=1`);
        console.log('API レスポンス:', response);
        const data = await response.json();
        
        console.log('API レスポンス:', data);
        
        if (!data.items || data.items.length === 0) {
            $('#response').html('検索結果が見つかりませんでした。');
            return;
        }

       


        let html = '<h3>検索結果:</h3>';
        data.items.forEach((item, index) => {
            const book = item.volumeInfo;
            const title = book.title || 'タイトル不明';
            const authors = book.authors ? book.authors.join(', ') : '著者不明';
            const description = book.description || '説明がありません';
            const publishedDate = book.publishedDate || '発売日不明';
            const pageCount = book.pageCount || '不明';


            
            
            html += `
                <div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0;">
                    <h4>${title}</h4>
                    <p><strong>著者:</strong> ${authors}</p>
                    <p><strong>発売日:</strong> ${publishedDate}</p>
                    <p><strong>ページ数:</strong> ${pageCount}ページ</p>
                    <p><strong>概要:</strong> ${description.substring(0, 200)}${description.length > 200 ? '...' : ''}</p>
                    <div style="margin-top: 10px;">
                        <a href="${book.infoLink || '#'}" target="_blank" style="margin-right: 10px;">詳細を見る</a>
                        
                    </div>
                </div>
            `;
        });

       const summaryPrompt = `
        検索キーワードと検索結果: ${textValue}, ${html}

        おすすめの書籍のポイントを、以下の形式で回答してお願いします：

        🏛️ **AIによる解説**
        - 📍 書籍名
        - 🌟 おすすめポイント
              どのような時に読むと良いか、どういう人におすすめか
        - 📸 価格
        `;
        
        
        callGeminiAPI(summaryPrompt);
  
        // 検索結果データをグローバル変数に保存
        window.searchResults = data.items;
        
        // 結果をHTMLに表示
        $('#response').html(html);
        console.log('検索結果表示完了');


        
    } catch (error) {
        console.error('検索エラー:', error);
        $('#response').html('検索中にエラーが発生しました。');
    }
}


// Gemini API呼び出し関数
function callGeminiAPI(summaryPrompt) {
    $('#response').html('考え中...');

    // @google/genai ライブラリを使用して Gemini API を呼び出す
    genAI.models
        .generateContent({
            model: 'gemini-2.5-flash',
            contents: summaryPrompt,
        })
        .then(function (response) {
            const aiResponse = response.text; // AIの回答を取得
            $('#ai-response').html(aiResponse); // AIの回答を表示
            console.log('Gemini API レスポンス:', response);
        });
}
