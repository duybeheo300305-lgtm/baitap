/**
 * Dữ liệu mẫu đầy đủ (album, thư, nhạc, món quà cuối) — dùng cho ?mode=demo
 */
(function (global) {
  function getDefaultDemoData() {
    return {
      intro: {
        recipientName: "My Love",
      },
      music: {
        tracks: [
          "./mp4/YTSave_YouTube_Dung-Lam-Trai-Tim-Anh-Dau-Obito-remake_Media_vqEoE3ABR-k_009_128k.mp3",
        ],
        selectedTrackUrl:
          "./mp4/YTSave_YouTube_Dung-Lam-Trai-Tim-Anh-Dau-Obito-remake_Media_vqEoE3ABR-k_009_128k.mp3",
      },
      book: {
        images: [
          { url: "./img/Ảnh 1.jpg", alt: "Ảnh album 1" },
          { url: "./img/ẢNh 2.jpg", alt: "Ảnh album 2" },
          { url: "./img/Ảnh 3.jpg", alt: "Ảnh album 3" },
          { url: "./img/Ảnh 4.jpg", alt: "Ảnh album 4" },
          { url: "./img/Ảnh 5.jpg", alt: "Ảnh album 5" },
          { url: "./img/Ảnh 6.jpg", alt: "Ảnh album 6" },
          { url: "./img/Ảnh 7.jpg", alt: "Ảnh album 7" },
          { url: "./img/Ảnh 8.jpg", alt: "Ảnh album 8" },
        ],
      },
      letter: {
        title: "Cưng à,",
        body:
          "Hôm nay là một ngày thật đặc biệt – ngày mà một người tuyệt vời như em xuất hiện trên thế giới này. Anh chỉ muốn nói rằng, gặp được em là điều may mắn nhất.\n\n" +
          "Chúc em luôn xinh đẹp,vui vẻ, hạnh phúc. Dù sau này có chuyện gì xảy ra, anh vẫn sẽ luôn nắm tay em và cùng đồng hành với em qua từng niềm vui nỗi buồn.",
        signature: "Yêu em bốn mùa không đổi .",
      },
      finalGift: {
        enabled: true,
        wishes: [
          "Happy Birthday 💕",
          "Yêu em nhất ❤️",
          "Tuổi mới thật hạnh phúc 💖",
          "Luôn vui vẻ nha Nàng",
          "Mãi yêu em ❤️",
          "Nhớ là phải thương bản thân đó nha 🧘‍♀️",
          "Cười nhiều hơn nhé,  Anh muốn thấy hoa nở 🌸"
        ],
      },
    };
  }

  global.__HB_getDefaultDemoData = getDefaultDemoData;
})(typeof window !== "undefined" ? window : globalThis);
