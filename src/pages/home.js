import React from 'react';
import { Link } from 'react-router-dom';

function Home() {
  return (
    <div>
      <h1 className="page-title">トップ画面</h1>
      <div>
        <Link to="/admin/user/login">
          <button>オーナーログイン</button>
        </Link>
      </div>
      <div>
        <Link to="/staff/user/login">
          <button>スタッフログイン</button>
        </Link>
      </div>
      <a href="https://github.com/haku-ohsumi/kokoro-shift-frontend/blob/main/README.md">説明資料・デモアカウント情報</a>
    </div>
  );
}

export default Home;