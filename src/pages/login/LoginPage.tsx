import styled from "styled-components";
import { Worker, Viewer } from "@react-pdf-viewer/core";
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";
import { config } from "../../core/config";

function LoginPage() {
  return (
    <>
      <div
        style={{ fontFamily: "IBM Plex Sans Thai, sans-serif" }}
        className="w-screen h-screen flex justify-center items-center bg-[url('/imgs/AngkaewBG.svg')] bg-cover bg-center bg-no-repeat"
      >
        <div
          className="w-3/5 h-[90vh] ml-16 mr-8 flex-col rounded-[40px] overflow-auto border-4 border-solid border-gray-200"
          style={{
            scrollbarWidth: "none", // For Firefox
            msOverflowStyle: "none", // For Internet Explorer and Edge
          }}
        >
          <style>{`
            /* Hide scrollbar for Chrome, Safari, and Opera */
            div::-webkit-scrollbar {
              display: none;
            }
          `}</style>

          <Worker
            workerUrl={`https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js`}
          >
            <Viewer fileUrl="/imgs/LongPlan_Poster.pdf" />
          </Worker>
        </div>
        <Container>
          <div className="flex flex-col items-center ml-10">
            <a
              className="flex relative justify-center items-center"
              href="https://sites.google.com/view/longplan/home?authuser=0"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img src="/imgs/login_logo.png" alt="" className="w-3/5" />
            </a>
            <div className="mt-8">ลงชื่อเข้าสู่ระบบ</div>
            <LoginBtn
              className="login-btn hover:scale-105 transition-all duration-300"
              href={config.cmuOAuthUrl}
              target="_self"
            >
              <img
                src="/imgs/login_sub_logo.png"
                alt="emblem"
                className="object-scale-down w-8 flex-[1] mx-4"
              />
              <div className="flex justify-center items-center border-l border-[#6869AC] h-full w-16 flex-[2] mr-4">
                <p className="font-normal text-2xl text-white">CMU Account</p>
              </div>
            </LoginBtn>
          </div>
        </Container>
      </div>
    </>
  );
}

export default LoginPage;

const Container = styled.div`
  width: 100vh;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-image: url(/imgs/login_book.svg);
  background-size: cover;
`;

const LoginBtn = styled.a`
  display: flex;
  justify-content: center;
  align-items: center;

  margin: 0 auto;
  margin-top: 0.5em;
  padding: 0.25em 0;

  max-width: 15em;
  height: 3.4em;
  width: 14em;

  font-size: 1.3em;

  border-radius: 10px;
  background: linear-gradient(90deg, #b1b1e7 0.83%, #6974d6 76.08%),
    var(--purple-5-purple, #6974d6);
`;
