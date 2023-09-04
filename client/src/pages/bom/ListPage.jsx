import { useState, useEffect } from "react";
import axios from "axios";
import PageCard from "../../components/page/PageCard";
import PageHeader from "../../components/page/PageHeader";
import PageTitle from "../../components/page/PageTitle";
import Table from "../../components/table/Table";
import Pagination from "../../components/pagination/Pagination";
import Button from "../../components/button/Button";
import ModalMain from "../../components/modal/ModalMain";
import ModalHeader from "../../components/modal/ModalHeader";
import ModalBody from "../../components/modal/ModalBody";
import ModalFooter from "../../components/modal/ModalFooter";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";
import { useLocation } from "react-router-dom/cjs/react-router-dom.min";

const ListPage = () => {
  const [data, setData] = useState([]);
  const [tableBody, setTableBody] = useState([]);
  const history = useHistory();

  //현재페이지를 url에 저장하기 위해
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const pageParam = params.get('page');
  //console.log(location.search);
  //console.log(params.get('page'));

  //배열 타입이므로 []
  const [posts, setPosts] = useState([]);

  //인터넷이 느릴 경우 로딩되는 중임을 보여주기 위해
  const [loading, setLoading] = useState(true);

  //현재 페이지 
  const [currentPage, setCurrentPage] = useState(1);

  //총 포스트 수
  const [numberOfData, setNumberOfData] = useState(0);

  //총 페이지 수
  const [numberOfPages, setNumberOfPages] = useState(0);

  //한 페이지에 몇개씩 글이 보일 것인지
  const limit = 5;

  useEffect(() => {
    //무조건 반올림 => 5개씩 출력 될때 14개면 3페이지가 출력 되어야 함
    setNumberOfPages(Math.ceil(numberOfData/limit));
    console.log(numberOfPages)
  }, [numberOfData]);
  //글갯수에 따라 페이지 수가 변경되기 때문에 의존성 배열에 포스트 수를 넣음

  //뒤로가기 했을 때 이전 페이지로 돌아가는게 아닌 다른페이지로 이동하는 문제 해결을 위해
  const onClickPageButton = (page) => {
    // history.push(`/admin?page=${page}`);
    //Blogs에서 다른 페이지 이동할 때 Admin의 페이지로 이동하는거 해결하기
    history.push(`${location.pathname}?page=${page}`);
    getData(page);

    //페이지 버튼 눌러도 색이 안바뀌어서 넣어 줌
    setCurrentPage(page);
  }
  const getData = (page = 1) => {
        
        
    let params = {
        _page: page,
        _limit: limit,
        _sort: 'bom_code',
        _order: 'desc',
        // title_like: searchText
    }

    console.log(params);
    
    
    
    //then은 콜백 함수
    //pagination 추가 (?_page=${page}&_limit=5) 페이지당 5개씩
    //sort와 order 통해 id 값을 내림차순으로 정렬해 최신글 먼저 보이기
    axios.get(`boms/data`, {
      
        
        params,
        
    }).then((res) => {
        //총 글 갯수
        // console.log(res);
        // setNumberOfData(res.headers['x-total-count']);
        setNumberOfData(res.data);
        //서버로 부터 넘어온 값은 파라미터로 가져옴 res
        setData(res.data);
        console.log(res.data);
        //데이터 값 불러왔으면 loading 값 false로
        setLoading(false);
        
    });
    
  };

  useEffect(() => {
      //넘어온 페이지 값으로 currentPage 값 적용
      setCurrentPage(parseInt(pageParam) || 1);

      //함수 호출해서 불러오기
      //리렌더링을 통해 현재 페이지 출력
      //pageParam은 string이기 때문에 int로 캐스팅을 해줘야 함
      //페이지 번호가 없다면 default로 1
      getData(parseInt(pageParam) || 1);

  //}, [pageParam, getPosts]);
  }, []);

  //서버 데이터 요청
  // useEffect(()=> {
  //   const getDate = async () => {
  //     const res = await axios.get('boms/data');
  //     setData(res.data);
  //   }
  //   getDate();
  // }, [])

  //테이블 데이터 가공
  useEffect(()=> {
    const arr = [];
    let itemList = [];
    for(let i=0; i<data.length; i++) {
      const {bom_code, product_name, bom_register_vo } = data[i];

      for(let j = 0; j < bom_register_vo.length; j++) {
        if(bom_register_vo[j].item_vo !== null){
          itemList.push({name: bom_register_vo[j].item_vo.item_name});
        }
      }
      const item_code = bom_code.substr(2, 5);
      const newData = {bom_code, product_name, item_code, item_name: itemList};
      arr.push(newData);
      itemList = [];

    };
    setTableBody([...arr]);
  }, [data])
 
  const tableHead = [
    { 
      key: 'no',
      title: '#'
    },
    { 
      key: 'bom_code',
      title: 'BOM코드',
      data: {
        link: {
          origin: "/boms",
          id: "bom_code"
        }
      },
      isToggle: true
    },
    { 
      key: 'item_code',
      title: '모품목코드'
    },
    { 
      key: 'product_name',
      title: '모품목명'
    },
    {
      key: 'item_name',
      title: '구성품목',
      isArray: true,
      data: {
        key: "name"
      }
    },
    {
      key: '',
      title: ''
    }
  ]

  const cthead = [
    {
      key: "no",
      title: "#",
      data: {
        class: [""],
      },
    },
    {
      key: "child_item_code", //필수
      title: "자품목 코드", //필수
    },
    {
      key: "child_item_name",
      title: "자품목명",
    },
    {
      key: "required_quantity",
      title: "필요수량",
    }]

  return (
    <PageCard>
      <PageHeader>
        <PageTitle value="BOM관리"/>
        <Button buttonClass={"btn-dark"} dataBsToggle={"modal"} dataBsTarget={"#basicModal"} buttonName="신규등록" />
      </PageHeader>
      <ModalMain>
        <ModalHeader>
        <h5 className="modal-title" id="exampleModalLabel1">BOM 신규 작성</h5>
        </ModalHeader>
        <ModalBody>
          <div className="row g-2">
            <div className="col mb-0">
              <div className="input-group input-group-merge">
                <span className="input-group-text" id="basic-addon-search31"><i className="bx bx-search"></i></span>
                <input 
                  type="text" 
                  className="form-control" 
                  id="item_name_input"  
                  placeholder="품목명 검색..." 
                  aria-label="Search..." 
                  aria-describedby="basic-addon-search31"
                />
              </div>
              <br/>
              <label htmlFor="item_name" className="form-label">모품목 선택</label>
              <select className="form-select" id="item_name" aria-label="모품목을 선택해 주세요">
 
              </select>
            </div>
          </div>
          <br/>
          <div className="row g-2">
            <div className="col mb-0">
              <label htmlFor="product_name" className="form-label">제품명</label>
              <input type="text" id="product_name" className="form-control" placeholder="BOM 등록할 제품명을 등록하세요." />
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button buttonClass={"btn-label-secondary"} dataBsDismiss={"modal"} buttonName={"취소"} />
          <Button ButtonId={"btnRegister"} buttonName={"BOM 등록"} />
        </ModalFooter>
      </ModalMain>
      <Table 
        thead={tableHead} 
        tbody={tableBody}
        isChild={true}
        cthead={cthead}  
      />
      {/* 페이지가 1개밖에 없을 때 페이지 버튼 안보이기 */}
      {numberOfPages > 1 && <Pagination 
                    currentPage={currentPage} 
                    numberOfPages={numberOfPages} 
                    //onClick={getPosts}    
                    onClick={onClickPageButton}    
                /> 
            }
    </PageCard>
  )
}

export default ListPage;