( ()=>{ /* 즉시 실행 함수형 */

    let stompClient = null; //메시지 송수신 객체
    let socket; //socket 정보

    // 로그인 상태값 재 설정
    function loginStatus(info){
        document.querySelector("#id").textContent = info.id;
        document.querySelector(".count").textContent = info.count;
        document.querySelector(".info").style.display=info.logoutState;
        document.querySelector(".btnLogin").style.display=info.loginState;
        if(info.noticeDisplay){
            document.querySelector("#notice").style.display="block";
        }else{
            document.querySelector("#notice").style.display="none";
        }
    }

    // 상태값 유지
    if(stompClient) stompClient.disconnect();  
    let info = sessionStorage.getItem("info"); 
    if(info){
        info = JSON.parse(info); 
        loginStatus(info); 
        connect(info.id) 
        .then(()=>{ 
            if(info.noticeDisplay) reloadList(); 
        })
    }else{
        document.querySelector(".info").style.display="none"; 
    }


    // 3) 로그인 버튼이 클릭되었을때
    let btnLogin = document.querySelector(".btnLogin");/*로그인 버튼 */
    btnLogin.addEventListener("click", ()=>{
        let dialogLogin = document.querySelector(".dialogLogin");
        dialogLogin.showModal(); //3-a)
        let btnCancel = dialogLogin.querySelector(".btnCancel");
        btnCancel.addEventListener("click", ()=>{
            dialogLogin.close(); //3-b)
        })

        // 폼안에서 로그인 버튼(OK)버튼이 클릭된 경우
        let btnOK = dialogLogin.querySelector(".btnOK");
        btnOK.addEventListener("click", ()=>{ //3-c)
            let frmLogin = dialogLogin.querySelector(".frmLogin");
            //3-d) 사용자 id를 사용한 소캣통신
            connect(frmLogin.id.value)
            .then(()=>{
                let message = { //3-e)
                    'command' : 'login',
                    'id'  : frmLogin.id.value,
                    'pwd' : frmLogin.pwd.value
                }
                sendMessage(message); //3-f)
            })
            .catch((err)=>{
                console.log(err);
            }); 
            dialogLogin.close();
        })
    })

    
    // 4) 로그아웃 버튼이 클릭되었을때
    let btnLogout = document.querySelector(".btnLogout");
    btnLogout.addEventListener("click", ()=>{
        sessionStorage.removeItem("info"); //4-a)
        document.querySelector(".btnLogin").style.display="inline" //4-b)
        document.querySelector(".info").style.display="none"; //4-c)
        let notice = document.querySelector("#notice");
        notice.style.display="none"; //4-d)
        // 연결 종료
        if(stompClient){
            stompClient.disconnect(); //4-e)
        }
    })



    // 5) soket 통신 
    function connect(id){
        return new Promise( (resolve, reject)=>{
            let client = `/topic/events/${id}`; //5-a)
            socket = new SockJS("/ws"); //5-b)
            stompClient = Stomp.over(socket); //5-c)
            stompClient.connect({}, (frame)=>{
                stompClient.subscribe(client, (event)=>{ //5-d)
                    showMessage(event.body); //5-e)
                });
                resolve(stompClient); //5-f)
            }, (error)=>{
                console.error("연결실패:", error);
                reject(error);
            })

        })
    }

    // 6) 메시지 전송
    function sendMessage(message) {
        let msg = message.command;
        let client = `/app/${msg}`; //6-a)
        if (stompClient) {
            stompClient.send(client, {}, JSON.stringify( message )); //6-b)
        } else {
            console.log("StompClient is not connected.");
        }
    }


    // 7) 공지 목록 보기
    let noticeList = document.querySelector(".count");
    noticeList.addEventListener("click", ()=>{
        let info = JSON.parse(sessionStorage.getItem("info"));

        let notice = document.querySelector("#notice");
        
        if(notice.style.display =='block'){ //7-a)
            notice.style.display='none';
            info.noticeDisplay=false;
        }else{
            notice.style.display='block';
            info.noticeDisplay=true;
            reloadList(); //7-b)
        }
        sessionStorage.setItem("info", JSON.stringify(info)); //7-d)

    });
    
    // 8) 공지 목록 새로고침
    function reloadList(){

        let info = JSON.parse(sessionStorage.getItem("info"));
        let message = { //8-a)
            'command' : 'list',
            'id' : info.id,
        }
        sendMessage(message); //8-b)
    }

    // 9) 공지사항 추가입력
    let btnInsert = document.querySelector(".btnInsert");
    btnInsert.addEventListener("click", ()=>{
        let dialogNotice = document.querySelector(".dialogNotice"); //9-a)
        let frm = dialogNotice.querySelector(".frmNotice"); //9-c)
        let info = JSON.parse(sessionStorage.getItem("info")); //9-d)
        frm.reset();
        frm.id.value = info.id; //작성자 아이디 설정
        
        //입력 버튼 보여주기
        dialogNotice.querySelector(".btnInsert").style.display="inline";
        // 수정, 삭제버튼 감추기
        dialogNotice.querySelector(".btnDelete").style.display="none";

        //제목, 내용 입력창 읽기전용 해제
        dialogNotice.querySelector(".subject").readOnly=false;
        dialogNotice.querySelector(".doc").readOnly=false;

        dialogNotice.showModal();
        dialogNotice.querySelector(".btnCancel").addEventListener("click", ()=>{
            dialogNotice.close(); //9-b)
        })

        // 입력버튼이 클릭된 경우
        dialogNotice.querySelector(".btnInsert").addEventListener("click", ()=>{
            let message={ //9-e)
                'command' : "noticeInsert",
                'id' : info.id,
                'subject' : frm.subject.value,
                'doc' : frm.doc.value
            }
            sendMessage(message);
            dialogNotice.close();
        }, {once : true}) //9-f)
    })

    // 한개의 공지사항 생성
    addNoticeRow = (template, data)=>{
        let clone = template.content.cloneNode(true); //11-f)
        let info = JSON.parse(sessionStorage.getItem("info"));
        clone.querySelector(".sno").textContent=data.sno;
        clone.querySelector(".id").textContent=data.id;
        clone.querySelector(".subject").textContent=data.subject;
        clone.querySelector(".doc").textContent=data.doc;
        clone.querySelector(".checking").textContent=data.checking;

        // 공지항목을 클릭했을 때
        let row = clone.querySelector(".row");
        row.addEventListener("click", (ev)=>{ //11-g)
            if(data.checking !=''){ //공지상태가 미확인 인경우
                let message={ //11-h)
                    'command' : 'noticeViewCheck',
                    'sno' : String(data.sno),
                    'id' : info.id
                }
                sendMessage(message);
            }

            //공지사항 세부내용 보기
            let dialogNotice = document.querySelector(".dialogNotice"); 
    
            //입력 버튼 감추기
            dialogNotice.querySelector(".btnInsert").style.display="none";

            // 작성자와 로그인 아이디가 같으면 수정, 삭제버튼 보여주기
            dialogNotice.querySelector(".subject").readOnly=true;
            dialogNotice.querySelector(".doc").readOnly=true;
            if(info.id==data.id){
                dialogNotice.querySelector(".btnDelete").style.display="inline";
            }else{
                dialogNotice.querySelector(".btnDelete").style.display="none";
            }

            let frm = dialogNotice.querySelector(".frmNotice");
            frm.id.value = data.id;
            frm.sno.value = data.sno;
            frm.subject.value = data.subject;
            frm.doc.value = data.doc;
    

            // 삭제 버튼
            dialogNotice.querySelector(".btnDelete").addEventListener("click", ()=>{
                let yn = confirm("삭제 하시겠습니까?");
                if(!yn) return;

                let frm = dialogNotice.querySelector(".frmNotice"); //9-c)
                let message={ //9-e)
                    'command' : "noticeDelete",
                    'id' : frm.id.value,
                    'sno' : String(frm.sno.value),
                }
                sendMessage(message);
                dialogNotice.close();
                frm.reset();
                
            },{once : true})

            //dialog 닫기
            dialogNotice.showModal();
            dialogNotice.querySelector(".btnCancel").addEventListener("click", ()=>{
                dialogNotice.close(); //9-b)
            })                
        })
        return clone;

    }

    // 11) 공지사항 목록 만들기
    showNoticeList = (list)=>{
        let count=0;
        let notice = document.querySelector("#notice");
        let items = document.querySelector(".items"); //11-a)
        let template = document.querySelector(".item"); //1-b)
        let clone;
        let info = sessionStorage.getItem("info"); //11-c)
        info = JSON.parse(info);

        items.innerHTML = "";

        list.forEach(d=>{ //11-d)
            console.log("d:", d);
            if(d.checking =="미확인") count++; //11-e)
            clone = addNoticeRow(template, d);
            items.append(clone); //1-i)

        })

        info.count = count; //11-j)
        sessionStorage.setItem("info", JSON.stringify(info));

        document.querySelector(".count").textContent = count;
        notice.style.display="block"; //11-k)
    }

    // 배지 애니메이션 
    function badgeAni(){
        let count = document.querySelector(".count"); //12-g)
        count.style.animation="pulse 3s 5"; //12-i)

        count.addEventListener("animationend", () => {
            count.style.animation = ""; // 초기화하여 재사용 가능
        });
    }

    // 공지목록이 표시되어 있는 상태라면 전달된 Notice정보를 상단에 추가함
    noticeInsert = (msg)=>{
        let info = JSON.parse(sessionStorage.getItem("info"));
        document.querySelector(".count").textContent = msg.cnt;
        requestAnimationFrame(badgeAni);
        if(info.noticeDisplay){
            let items = document.querySelector(".items");
            let template = document.querySelector(".item");
            let clone = addNoticeRow(template, msg.noticeVo);
            
            items.prepend(clone); //12-k)
        }
    }

    // 공지목록이 표시되어 있는 상태라면 sno에 해당하는 목록을 화면에서 제거
    noticeDelete = (msg)=>{
        let info = JSON.parse(sessionStorage.getItem("info"));
        if(info.noticeDisplay){
            let items = document.querySelector(".items");
            let rows = items.querySelectorAll(".row");
            let count = Number(document.querySelector(".count").textContent);
            rows.forEach(row =>{
                let sno = row.querySelector(".sno").textContent;
                if(sno == msg.sno){
                    if(row.querySelector(".checking").textContent=='미확인'){
                        count--;
                        document.querySelector(".count").textContent = count;
                    }

                    items.removeChild(row);
                }
            })

        }
    }



    // 12) socket server로 부터 메시지가 전달되었을 때
    function showMessage(message){
        let msg = JSON.parse(message);
        if( !msg.status ) return; //12-a)
        
        switch(msg.command){
            case "login" :
                msg.loginState = "none"; //12-b)
                msg.logoutState = "inline";
                sessionStorage.setItem("info", JSON.stringify(msg));
                console.log("loginStatus")
                loginStatus(msg); //12-c)
                break;

            case "list":
                console.log('msg.list:', msg.list);
                showNoticeList(msg.list);
                break;

            case "noticeViewCheck":
                reloadList(); //12-d)
                break;

            case "noticeInsert":
                noticeInsert(msg);
                break;

            case "noticeDelete":
                noticeDelete(msg);
                break;

        }
    }

})()