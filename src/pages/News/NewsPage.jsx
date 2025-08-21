const NewsPage = () => {
    return (
        <div style={{ marginTop: '70px', padding: '20px' }}>
            <h1>뉴스 페이지</h1>
            
            <iframe
                src="https://mediahub.seoul.go.kr/news/hometown/hometownIframeNewsList.do?area=140"
                width="100%"
                height="800px"
                style={{ border: "none" }}
                title="중구 뉴스"
            />
        </div>
    );
};

export default NewsPage;
