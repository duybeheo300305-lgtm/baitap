const fs = require('fs');

const baseHtml = fs.readFileSync('Shop Hoa.html', 'utf8');

// Hàm tạo nội dung trang mới
function createPage(activeLinkText, newContent) {
    let html = baseHtml;
    
    // Xóa Banner
    html = html.replace(/<!-- Banner -->[\s\S]*?<\/section>/, '');
    
    // Đổi Active link
    html = html.replace('class="active">Trang chủ', '>Trang chủ');
    html = html.replace(`>${activeLinkText}</a>`, ` class="active">${activeLinkText}</a>`);
    
    // Đổi phần Main Content
    html = html.replace(/<!-- Cột Phải -->[\s\S]*?<\/main>/, `<!-- Cột Phải -->\n        ${newContent}\n    </main>`);
    
    return html;
}

// 1. Trang Giới thiệu
const introContent = `<section class="products-section intro-section">
            <h2 class="section-title">Giới thiệu về vườn Đức Duy</h2>
            <div class="intro-content" style="font-size: 14px; line-height: 1.8; color: #222;">
                <p style="margin-bottom: 10px;"><strong>Lời nói đầu, Tiệm Cây Cảnh Đức Duy xin gửi lời chúc sức khỏe và lời cảm ơn chân thành đến Quý khách hàng đã, đang và sẽ tin tưởng lựa chọn sản phẩm, dịch vụ của chúng tôi. Xuất phát từ mong muốn mang thiên nhiên đến gần hơn với cuộc sống, góp phần tạo nên không gian xanh mát, trong lành và đầy sức sống, Tiệm Cây Cảnh Đức Duy tự hào là đơn vị hoạt động tận tâm trong lĩnh vực cung cấp và chăm sóc cây cảnh. Chúng tôi luôn hướng đến việc nâng cao chất lượng không gian sống và làm việc cho khách hàng thông qua những giải pháp xanh hiệu quả và thẩm mỹ.</strong></p>
                <p style="margin-bottom: 15px;"><strong>Với đội ngũ nhân viên nhiệt tình, giàu kinh nghiệm cùng sự am hiểu sâu sắc về cây trồng, Đức Duy cam kết mang đến cho khách hàng những sản phẩm và dịch vụ tốt nhất trong các lĩnh vực sau:</strong></p>
                <p style="margin-bottom: 10px; margin-left: 15px;"><strong>1. Tư vấn, thiết kế và thi công cảnh quan</strong><br>Nhận thiết kế và thi công sân vườn, quán cafe, nhà hàng, khách sạn, trường học, bệnh viện, văn phòng, nhà phố, biệt thự... đảm bảo tính thẩm mỹ và phù hợp với nhu cầu thực tế.</p>
                <p style="margin-bottom: 10px; margin-left: 15px;"><strong>2. Cung cấp và kinh doanh cây xanh</strong><br>Chuyên cung cấp đa dạng các loại cây cảnh nội thất, ngoại thất, cây phong thủy, cây ăn trái và các loại hoa trang trí với chất lượng cao và giá cả hợp lý.</p>
                <p style="margin-bottom: 10px; margin-left: 15px;"><strong>3. Dịch vụ chăm sóc và bảo dưỡng cây cảnh</strong><br>Nhận chăm sóc, cắt tỉa, bảo dưỡng định kỳ và di dời cây xanh với chi phí tiết kiệm, giúp cây luôn phát triển khỏe mạnh.</p>
                <p style="margin-bottom: 15px; margin-left: 15px;"><strong>4. Cung cấp chậu cây cảnh đa dạng</strong><br>Cung cấp nhiều loại chậu như chậu xi măng, chậu sứ, chậu đất nung, chậu nhựa, chậu composite... với mẫu mã phong phú, chất lượng đảm bảo và giá thành cạnh tranh.</p>
                <p style="margin-bottom: 10px; font-style: italic;"><strong>Tiệm Cây Cảnh Đức Duy luôn mong muốn trở thành người bạn đồng hành đáng tin cậy, mang đến không gian xanh lý tưởng cho mọi công trình và ngôi nhà của bạn.</strong></p>
            </div>
        </section>`;
fs.writeFileSync('gioithieu.html', createPage('Giới Thiệu', introContent));

// 2. Trang Dịch vụ
const serviceContent = `<section class="products-section service-section">
            <h2 class="section-title">Các dịch vụ của cửa hàng</h2>
            <div class="service-buttons" style="margin-top: 40px;">
                <button class="service-btn" style="background-color: #4CAF50; color: #111; padding: 15px 40px; border: 2px solid #2e7d32; border-radius: 10px; font-size: 16px; font-weight: bold; margin-bottom: 20px; display: block; width: 60%; margin: 0 auto 30px; cursor: pointer; text-align: center; box-shadow: 2px 2px 5px rgba(0,0,0,0.2);">Đặt trực tiếp qua số điện thoại</button>
                <button class="service-btn" style="background-color: #4CAF50; color: #111; padding: 15px 40px; border: 2px solid #2e7d32; border-radius: 10px; font-size: 16px; font-weight: bold; display: block; width: 60%; margin: 0 auto; cursor: pointer; text-align: center; box-shadow: 2px 2px 5px rgba(0,0,0,0.2);">Đặt qua website</button>
            </div>
        </section>`;
fs.writeFileSync('dichvu.html', createPage('Dịch Vụ', serviceContent));

// 3. Trang Hoạt động
const activityContent = `<section class="products-section activity-section">
            <h2 class="section-title">Hoạt động</h2>
            <div class="activity-content">
            </div>
        </section>`;
fs.writeFileSync('hoatdong.html', createPage('Hoạt Động', activityContent));

// 4. Trang Tin tức
const newsContent = `<section class="products-section news-section">
            <div class="news-card" style="width: 60%; background: #fff; padding: 15px; border-radius: 10px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
                <div class="news-images" style="display: grid; grid-template-columns: 1fr 1fr; gap: 5px;">
                    <img src="img/tải xuống (5) 1.png" alt="Tin tức 1" style="width: 100%; height: 120px; object-fit: cover; border-radius: 8px 0 0 0;">
                    <img src="img/Rectangle 30.png" alt="Tin tức 2" style="width: 100%; height: 120px; object-fit: cover; border-radius: 0 8px 0 0;">
                    <img src="img/images 2.png" alt="Tin tức 3" style="width: 100%; height: 120px; object-fit: cover; border-radius: 0 0 0 8px;">
                    <img src="img/tải xuống (2) 2.png" alt="Tin tức 4" style="width: 100%; height: 120px; object-fit: cover; border-radius: 0 0 8px 0;">
                </div>
                <h3 style="margin-top: 15px; font-size: 16px; font-weight: bold; line-height: 1.4;"><a href="#" style="text-decoration: underline; color: #111;">Top 20+ cây cảnh trồng trong nhà tuyệt đẹp, dễ chăm sóc</a></h3>
            </div>
        </section>`;
fs.writeFileSync('tintuc.html', createPage('Tin tức', newsContent));

console.log('Đã tạo xong các file HTML!');
