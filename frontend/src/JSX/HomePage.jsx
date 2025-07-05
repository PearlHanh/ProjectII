  import "../CSS/HomePage.css"
  import { useState, useEffect } from "react";
  import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
  import dayjs from 'dayjs';
  import { RefreshCcw, Trash } from "lucide-react";
    export default function HomePage(){
    // calendar
    const [markedDates, setMarkedDates] = useState([]);
    const [value, setValue] = useState(new Date());

    const tileClassName = ({ date, view }) => {
        if (view === 'month') {
          const formatted = dayjs(date).format('YYYY-MM-DD');
          if (markedDates.includes(formatted)) {
            return 'marked';
          }
        }
        return null;
      };

      const handleClickDay = (value, event) => {
        console.log("Ngày bạn đã chọn:", value);
        // TODO: đánh dấu điểm danh ở đây
      };
      const [activedId, setActiveId] = useState(null);
      const [tables, setTables] = useState([]); // ← Lưu danh sách bàn
      const homeBtn = () => {
          window.location.reload();
      }

      const handleButtonClick = (id) => { 
          setActiveId(id);

      }

      //useState cho table
      const [selectedTable, setSelectedTable] = useState(null);
      const handleTableClick = (id) => {
          setSelectedTable(id);
          console.log(`Clicked table ${id}`);
          // Gọi API để lấy dữ liệu món ăn theo bàn
      fetch(`https://projectii-production.up.railway.app/api/order/${id}`)
      .then((res) => res.json())
      .then((data) => {
          console.log("Dữ liệu JSON trả về từ server:", data);
          setOrderedDishes(data);
      })
      .catch((err) => console.error("Lỗi khi lấy dữ liệu món ăn:", err));
      };
      
      // useEffect cho tablename
      useEffect(() => {
          fetch("https://projectii-production.up.railway.app/api/tablename") // Điều chỉnh port nếu khác
              .then((res) => res.json())
              .then((data) => setTables(data))
              .catch((err) => console.error("Lỗi khi lấy danh sách bàn:", err));
      }, []);

      // Hien thong tin mon an
      const [orderedDishes, setOrderedDishes] = useState([]);


      //Statistics
      const [chartData, setChartData] = useState([]);

      useEffect(() => {
        if (activedId === 2) {
          fetch("https://projectii-production.up.railway.app/api/statistics/dish")
            .then((res) => res.json())
            .then((data) => {
              const formatted = data.map(item => ({
                name: item.dish_name,
                value: item.total_quantity
              }));
              setChartData(formatted);
            })
            .catch((err) => console.error("Lỗi lấy dữ liệu thống kê:", err));
        }
      }, [activedId]);

      // Bang doanh thu
      const [revenueChartData, setRevenueChartData] = useState([]);
      useEffect(() => {
        if (activedId === 2) {
          fetch("https://projectii-production.up.railway.app/api/statistics/dish")
            .then((res) => res.json())
            .then((data) => {
              const revenueData = data.map(item => ({
                name: item.dish_name,
                value: item.total_cost,
                formattedValue: new Intl.NumberFormat('vi-VN').format(item.total_quantity) + 'đ'
              })) .sort((a, b) => b.value - a.value);;
              setRevenueChartData(revenueData);
            })
            .catch((err) => console.error("Lỗi lấy dữ liệu doanh thu:", err));
        }
      }, [activedId]);
      // Lay danh sach tung thang, ngay, nam
      const [dishPeriod, setDishPeriod] = useState(); // biểu đồ số lượng
      const handleDishPeriodChange = (e) => {
        setDishPeriod(e.target.value);
      };
      useEffect(() => {
        if (activedId === 2) {
          fetch(`https://projectii-production.up.railway.app/api/statistics/dish?period=${dishPeriod}`)
            .then((res) => res.json())
            .then((data) => {
              const dishData = data.map(item => ({
                name: item.dish_name ,
                value: item.total_quantity ?? 0,
                formattedValue: new Intl.NumberFormat('vi-VN').format(item.total_quantity) + 'đ'
              })).sort((a, b) => b.value - a.value);
      
              setChartData(dishData);
            })
            .catch((err) => console.error("Lỗi lấy dữ liệu món ăn:", err));
        }
      }, [activedId, dishPeriod]);
      

      //
      //
      //
      //
      //

      const [revenuePeriod, setRevenuePeriod] = useState(); // biểu đồ doanh thu
      const handleRevenuePeriodChange = (e) => {
        setRevenuePeriod(e.target.value);
      };
      useEffect(() => {
    if (activedId === 2) {
      fetch(`https://projectii-production.up.railway.app/api/statistics/dish?period=${revenuePeriod}`)
        .then((res) => res.json())
        .then((data) => {
          const revenueData = data.map(item => ({
            name: item.dish_name,
            value: item.total_cost ?? 0,
            formattedValue: new Intl.NumberFormat('vi-VN').format(item.total_cost) + 'đ'
          })).sort((a, b) => b.value - a.value);

          setRevenueChartData(revenueData);
        })
        .catch((err) => console.error("Lỗi lấy dữ liệu doanh thu:", err));
    }
  }, [activedId, revenuePeriod]);

  // Lấy danh sách nhân viên
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    fetch("https://projectii-production.up.railway.app/api/employee")
      .then((res) => res.json())
      .then((data) => setEmployees(data))
      .catch((err) => console.error("Lỗi khi lấy danh sách nhân viên:", err));
  }, []);


  // Cập nhật thong tin nhân viên
  const [tabType, setTabType] = useState(null); // 'update' | null
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const handleUpdateClick = (employee) => {
    setSelectedEmployee(employee);
    setTabType("update");
  };


  // Xử lý sự kiện khi nhấn nút "Cập nhật" trong tab
  const [formData, setFormData] = useState({
    id_employee: "",
    employee_name: "",
    birthday: "",
    gender: "",
    phone: "",
    office_name: ""
  });
  useEffect(() => {
    if (selectedEmployee) {
      setFormData({
        id_employee: selectedEmployee.id_employee,
        employee_name: selectedEmployee.employee_name,
        birthday: dayjs(selectedEmployee.birthday).format("YYYY-MM-DD"),
        gender: selectedEmployee.gender,
        phone: selectedEmployee.phone,
        office_name: selectedEmployee.office_name
      });
    }
  }, [selectedEmployee]);
  // Xử lý cập nhật nhân viên
  const handleUpdateEmployee = async () => {
    try {
      const res = await fetch("https://projectii-production.up.railway.app/api/employee/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });

      if (!res.ok) throw new Error("Cập nhật thất bại");
      alert("Cập nhật thành công");

      // Cập nhật lại danh sách nhân viên
      const updatedList = await fetch("https://projectii-production.up.railway.app/api/employee").then(r => r.json());
      setEmployees(updatedList);
      setTabType(null); // Đóng tab cập nhật
    } catch (err) {
      console.error(err);
      alert("Đã xảy ra lỗi khi cập nhật nhân viên");
    }
  };


  const handleConfirmUpdate = () => {
    const { id_employee, employee_name, birthday, gender, phone, office_name } = formData;
    fetch(`https://projectii-production.up.railway.app/api/employee/${selectedEmployee.id_employee}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ employee_name, birthday, gender, phone, office_name }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Cập nhật thất bại");
        alert("Cập nhật thành công!");
        setTabType(null);
      })
      .catch((err) => {
        console.error(err);
        alert("Lỗi khi cập nhật nhân viên");
      });
  };
  // Lấy danh sách cong viec  
  const [offices, setOffices] = useState([]);

  useEffect(() => {
    fetch("https://projectii-production.up.railway.app/api/office")
      .then(res => res.json())
      .then(data => setOffices(data))
      .catch(err => console.error("Lỗi khi load office:", err));
  }, []);

  // Checkbox cho nhân viên
  const [checkedEmployees, setCheckedEmployees] = useState({});
  const [disabledEmployees, setDisabledEmployees] = useState({});
  
  // ✅ Gọi API để lấy danh sách nhân viên đã chấm công hôm nay
  useEffect(() => {
    const fetchTodayAttendance = async () => {
      try {
        const res = await fetch("https://projectii-production.up.railway.app/api/timekeeping/today");
        if (!res.ok) throw new Error("Không lấy được danh sách đã chấm công");
        const ids = await res.json(); // giả sử API trả về mảng id_employee
        const disabledMap = {};
        ids.forEach(id => {
          disabledMap[id] = true;
        });
        setDisabledEmployees(disabledMap);
      } catch (err) {
        console.error("Lỗi khi kiểm tra chấm công hôm nay:", err);
      }
    };
  
    fetchTodayAttendance();
  }, []);
  
  // ✅ Hàm xác nhận chấm công
  const handleConfirmAttendance = () => {
    const today = dayjs().format("YYYY-MM-DD");
    const entries = Object.entries(checkedEmployees);
  
    const dataToSend = entries.map(([id_employee, isChecked]) => ({
      id_employee,
      day: today,
      is_presence: isChecked ? 1 : 0,
    }));
  
    fetch("https://projectii-production.up.railway.app/api/timekeeping", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: dataToSend }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Lỗi khi chấm công");
  
        alert("✅ Chấm công thành công");
  
        // ✅ Gọi lại API để cập nhật danh sách đã bị khóa
        return fetch("https://projectii-production.up.railway.app/api/timekeeping/today");
      })
      .then((res) => res.json())
      .then((ids) => {
        const disabledMap = {};
        ids.forEach(id => {
          disabledMap[id] = true;
        });
        setDisabledEmployees(disabledMap);
      })
      .catch((err) => {
        console.error(err);
        alert("❌ Có lỗi khi chấm công");
      });
  };
  

  const handleSubmitEmployee = async () => {
    const { id_employee, employee_name, birthday, gender, phone, office_name } = formData;
  
    const method = tabType === "add" ? "POST" : "PUT";
    const url =
      tabType === "add"
        ? "https://projectii-production.up.railway.app/api/employee/create"
        : `https://projectii-production.up.railway.app/api/employee/${formData.id_employee}`;
  
    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_employee, employee_name, birthday, gender, phone, office_name })
      });
  
      if (!res.ok) throw new Error(`${tabType === "add" ? "Thêm" : "Cập nhật"} thất bại`);
  
      alert(`${tabType === "add" ? "✅ Đã thêm nhân viên" : "✅ Cập nhật thành công"}`);
  
      const updatedList = await fetch("https://projectii-production.up.railway.app/api/employee").then(r => r.json());
      setEmployees(updatedList);
      setTabType(null);
    } catch (err) {
      console.error(err);
      alert(`❌ Lỗi khi ${tabType === "add" ? "thêm" : "cập nhật"} nhân viên`);
    }
  };


const [dishList, setDishList] = useState([]);

useEffect(() => {
  fetch("https://projectii-production.up.railway.app/api/orderlist")
    .then((res) => res.json())
    .then((data) => setDishList(data))
    .catch((err) => console.error("Lỗi khi lấy danh sách món ăn:", err));
}, []);



const [editingRowId, setEditingRowId] = useState(null);
const [editValues, setEditValues] = useState({ dish_cost: "", dish_stock: "" });


const handleSaveEdit = async (id_dish) => {
  try {
    const res = await fetch(`https://projectii-production.up.railway.app/api/orderlist/${id_dish}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        dish_cost: parseInt(editValues.dish_cost),
        dish_stock: parseInt(editValues.dish_stock)
      })
    });

    if (!res.ok) throw new Error("Cập nhật thất bại");

    alert("✅ Cập nhật thành công");

    // Cập nhật lại danh sách món ăn
    const updated = await fetch("https://projectii-production.up.railway.app/api/orderlist").then(r => r.json());
    setDishList(updated);

    setEditingRowId(null);  
  } catch (err) {
    console.error(err);
    alert("❌ Lỗi khi cập nhật");
  }
};

const handleAddDish = async () => {
  const { id_dish, dish_name, dish_cost, dish_image, type_of_dish, dish_stock } = newDish;

  // Kiểm tra rỗng
  if (!dish_name || !type_of_dish || !dish_cost || !dish_stock || !dish_image) {
    alert("❌ Vui lòng điền đầy đủ thông tin món ăn.");
    return;
  }

  try {
    const res = await fetch("https://projectii-production.up.railway.app/api/dish/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id_dish,
        dish_name,
        dish_cost: parseInt(dish_cost),

        type_of_dish,
        dish_image,
        dish_stock: parseInt(dish_stock)
      })
    });

    if (!res.ok) throw new Error("Thêm món ăn thất bại");

    alert("✅ Đã thêm món ăn!");

    // Làm mới danh sách món ăn
    const updated = await fetch("https://projectii-production.up.railway.app/api/orderlist").then(r => r.json());
    setDishList(updated);

    // Reset form
    setNewDish({
      id_dish: "",
      dish_name: "",
      type_of_dish: "",
      dish_cost: "",
      dish_stock: "",
      dish_image: ""
    });
  } catch (err) {
    console.error(err);
    alert("❌ Có lỗi xảy ra khi thêm món ăn.");
  }
};


const handleDeleteDish = async (id_dish) => {
  if (!window.confirm("Bạn có chắc chắn muốn xoá món ăn này?")) return;

  try {
    const res = await fetch(`https://projectii-production.up.railway.app/api/dish/${id_dish}`, {
      method: "DELETE",
    });

    if (!res.ok) throw new Error("Xoá thất bại");

    // Xoá thành công => cập nhật lại danh sách
    const updated = await fetch("https://projectii-production.up.railway.app/api/orderlist").then(r => r.json());
    setDishList(updated);

    alert("✅ Đã xoá món ăn");
  } catch (err) {
    console.error(err);
    alert("❌ Lỗi khi xoá món ăn");
  }
};
const [newDish, setNewDish] = useState({
  id_dish: "",
  dish_name: "",
  type_of_dish: "",
  dish_cost: "",
  dish_stock: "",
  dish_image: ""
});

const handlePay = async () => {
  const total = orderedDishes.reduce((sum, d) => sum + d.total_cost, 0);
  try {
    const res = await fetch("https://projectii-production.up.railway.app/api/create-payment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orderCode: Date.now(),
        amount: total,
        description: `Thanh toán bàn ${selectedTable}`,
      }),
    });

    const data = await res.json();
    console.log("Link thanh toán:", data);

    if (data.checkoutUrl) {
      // Gắn event listener để xóa order sau khi thanh toán xong (sau khi quay lại từ PayOS)
      window.localStorage.setItem("pendingClearTable", selectedTable); // lưu để xử lý sau
      window.location.href = data.checkoutUrl;
    } else {
      throw new Error(data.error);
    }
  } catch (err) {
    console.error(err);
    alert("Thanh toán thất bại");
  }
};
useEffect(() => {
  const tableToClear = localStorage.getItem("pendingClearTable");

  // Nếu có bàn cần xóa (sau khi quay lại từ PayOS)
  if (tableToClear) {
    fetch(`https://projectii-production.up.railway.app/api/ordertable/delete/${tableToClear}`, {
      method: "DELETE",
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("Đã xoá món sau thanh toán:", data);
        setOrderedDishes([]); // clear UI
        setSelectedTable(null);
        localStorage.removeItem("pendingClearTable");
      })
      .catch((err) => {
        console.error("Lỗi khi xóa món sau thanh toán:", err);
      });
  }
}, []);


// Tinh tien luong
const [selectedMonth, setSelectedMonth] = useState(dayjs().format("YYYY-MM"));
const [salaryData, setSalaryData] = useState([]);
const [paidStatus, setPaidStatus] = useState({}); // {id_employee: true/false}
const [disabledCheckboxes, setDisabledCheckboxes] = useState({});
const fetchSalaryData = async () => {
  try {
    const res = await fetch(`https://projectii-production.up.railway.app/api/salary?month=${selectedMonth}`);
    if (!res.ok) throw new Error("Lỗi khi lấy dữ liệu lương");
    const data = await res.json();
    setSalaryData(data);
  } catch (err) {
    console.error("Lỗi khi fetch salary:", err);
  }
};


useEffect(() => {
  const fetchData = async () => {
    try {
      const res = await fetch(`https://projectii-production.up.railway.app/api/salary?month=${selectedMonth}`);
      if (!res.ok) throw new Error("Lỗi khi lấy dữ liệu lương");
      const data = await res.json();
      setSalaryData(data);
    } catch (err) {
      console.error(err);
    }
  };

  fetchData();
}, [selectedMonth]);
// Xử lý khi nhấn nút xác nhận thanh toán
const handleSalaryConfirm = async () => {
  const checkedIds = Object.entries(paidStatus)
    .filter(([_, checked]) => checked)
    .map(([id]) => id);

  if (checkedIds.length === 0) {
    alert("Vui lòng chọn ít nhất 1 nhân viên để thanh toán");
    return;
  }

  try {
    await fetch("https://projectii-production.up.railway.app/api/timekeeping/status", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        month: selectedMonth,
        employeeIds: checkedIds,
      }),
    });

    alert("✅ Đã cập nhật trạng thái thanh toán");
    // Reload bảng
    fetchSalaryData();
    setPaidStatus({});
  } catch (err) {
    console.error(err);
    alert("❌ Cập nhật thất bại");
  }
};

// Load lại từ localStorage nếu có
useEffect(() => {
  const saved = localStorage.getItem("disabledCheckboxes");
  if (saved) setDisabledCheckboxes(JSON.parse(saved));
}, []);



const handleDeleteEmployee = async (id_employee) => {
  if (!window.confirm("❗Bạn có chắc chắn muốn xoá nhân viên này?")) return;

  try {
    const res = await fetch(`https://projectii-production.up.railway.app/api/employee/delete/${id_employee}`, {
      method: "DELETE",
    });

    if (!res.ok) throw new Error("Xoá thất bại");

    alert("✅ Đã xoá nhân viên");

    // Cập nhật lại danh sách nhân viên
    const updated = await fetch("https://projectii-production.up.railway.app/api/employee").then(r => r.json());
    setEmployees(updated);
  } catch (err) {
    console.error(err);
    alert("❌ Lỗi khi xoá nhân viên");
  }

}

const handleCashPayment = async () => {
  const total = orderedDishes.reduce((sum, d) => sum + d.total_cost, 0);

  if (!selectedTable) {
    alert("❌ Bạn chưa chọn bàn!");
    return;
  }

  if (!orderedDishes.length) {
    alert("❌ Bàn chưa có món nào để thanh toán!");
    return;
  }

  if (!window.confirm(`Xác nhận đã nhận ${total.toLocaleString("vi-VN")}đ tiền mặt từ bàn ${selectedTable}?`)) {
    return;
  }

  try {
    const res = await fetch(`https://projectii-production.up.railway.app/api/ordertable/delete/${selectedTable}`, {
      method: "DELETE",
    });

    const data = await res.json();
    console.log("✅ Đã xoá món sau thanh toán tiền mặt:", data);

    // Clear UI
    setOrderedDishes([]);
    setSelectedTable(null);

    alert("💵 Đã thanh toán tiền mặt thành công!");
  } catch (err) {
    console.error("❌ Lỗi khi thanh toán tiền mặt:", err);
    alert("Đã xảy ra lỗi khi xoá món. Vui lòng thử lại.");
  }
};








      return(
      <div className="orderScreen">
          <div className="toolbar">
              <button className="btn home" onClick={()=>{homeBtn; handleButtonClick(1)}}>Home</button>
              <button className="btn goods" onClick={() => handleButtonClick(2)}>Goods</button>
              <button className="btn timesheet" onClick={() => handleButtonClick(3)}>Time Sheet</button>
              <button className="btn manageBtn" onClick={() => handleButtonClick(4)}>Manage</button>
              <button className="btn salarysheet" onClick={() => handleButtonClick(5)}>Salary</button>
              <button
  className="btn logout"
  onClick={() => {
    if (window.confirm("Bạn có chắc chắn muốn đăng xuất?")) {
      window.location.href = "/"; // hoặc dùng navigate nếu có React Router
    }
  }}
>
  Log out
</button>
              <div className="spacer"></div>
          </div>

          <div className="BHA">
              {activedId === 1 && (
                          <div className="ordertable">
                              <div className="table">
                                  <div className="content">
                                  <div className="table-list-container">
                                  <div className="table-list">
                                      {tables.map((table) => (
                                          <div
                                              key={table.id_table}
                                              className={`table-item ${selectedTable === table.id_table ? "selected" : ""}`}
                                              onClick={() => handleTableClick(table.id_table)}
                                          >
                                              <img src={'/table.png'} alt={table.table_name} className="table-image" />
                                              <h2>{table.table_name}</h2>

                                          </div>
                                      ))}
                                  </div>
                              </div>

                                      </div>
                              </div>

                          <div className="detail">
                              <div className="listOfDishes">
                              {orderedDishes.length === 0 ? (
                                  <p>Chưa có món nào được đặt.</p>) : (
                                      orderedDishes.map((dish) => (
                                      <div key={dish.id_dish} className="dish-item">
                                          <img src={dish.dish_image} alt={dish.dish_name} className="dish-image" />
                                          <div className="dish-info">
                                              <h4>{dish.dish_name}</h4>
                                              <p>Số lượng: {dish.dish_quantity}</p>
                                              <p>Đơn giá: {dish.dish_cost.toLocaleString("vi-VN")}đ</p>
                                              <p>Thành tiền: {dish.total_cost.toLocaleString("vi-VN")}đ</p>
          </div>
        </div>
      ))
    )}
   <button
  className="pay"
  onClick={handlePay}
>
Chuyển khoản
</button>
<button
  className="pay2"
  onClick={handleCashPayment}
>
Tiền mặt
</button>
                                  </div>
                          </div>
                      </div>
                  )}
  {activedId === 2 && (
    <div className="goodstable">
      <div className="table2">
        <div className="content2">
          <div className="stat-bag">
              <div className="stat">
              <h1 className="headerstat1">Thống kê món ăn đã bán</h1>
              <select
              className="p-2 border border-gray-300 rounded-md"
              value={dishPeriod}
              onChange={handleDishPeriodChange}>
              <option value="thismonth">Tháng này</option>
              <option value="premonth">Tháng trước</option>
              <option value="thisweek">Tuần này</option>
              <option value="thisday">Hôm nay</option>
              </select>
            <ResponsiveContainer width="100%" height="70%">
              <BarChart
                data={chartData}
                layout="vertical" // ⚠️ Quan trọng: để xoay ngang
                margin={{ top: 20, right: 30, left: 40, bottom: 5 }}
              >
                <XAxis type="number" />
                <YAxis type="category" dataKey="name" />
                <Tooltip />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="stat2">
              <h1 className="headerstat2">Biểu đồ doanh thu</h1>
          <select
          className="p-2 border border-gray-300 rounded-md"
          value={revenuePeriod}
          onChange={handleRevenuePeriodChange}>
              <option value="thismonth">Tháng này</option>
              <option value="premonth">Tháng trước</option>
              <option value="thisweek">Tuần này</option>
              <option value="thisday">Hôm nay</option>

    </select>
            <ResponsiveContainer width="100%" height="70%">
              <BarChart
                data={revenueChartData}
                layout="vertical" // ⚠️ Quan trọng: để xoay ngang
                margin={{ top: 20, right: 30, left: 40, bottom: 5 }}
              >
                <XAxis type="number"
                tickFormatter={(value) => new Intl.NumberFormat('vi-VN').format(value) + 'đ'} />
                <YAxis type="category" dataKey="name" />
                <Tooltip
                formatter={(value) =>
                  new Intl.NumberFormat('vi-VN').format(value) + 'đ'
                } />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  )}

  {activedId === 3 && (
    <div className="timesheettable">
      <div className="table3">
                  {/* ✅ Layout chia 2 cột: bảng + tab */}
          <div className="employee-layout">
            {/* Bảng nhân viên */}
            <div className="table-wrapper">
              <table className="employee-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Tên nhân viên</th>
                    <th>Ngày sinh</th>
                    <th>Giới tính</th>
                    <th>Số điện thoại</th>
                    <th>Vai trò</th>
                    <th>Chấm công</th>
                    <th></th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map((emp) => (
                    <tr key={emp.id_employee}>
                      <td>{emp.id_employee}</td>
                      <td>{emp.employee_name}</td>
                      <td>{dayjs(emp.birthday).format("DD-MM-YYYY")}</td>
                      <td>{emp.gender}</td>
                      <td>{emp.phone}</td>
                      <td>{emp.office_name}</td>
                      <td className="checkbox-cell">
                      <input
    type="checkbox"
    className="large-checkbox"
    checked={checkedEmployees[emp.id_employee] || false}
    onChange={() => {
      setCheckedEmployees((prev) => ({
        ...prev,
        [emp.id_employee]: !prev[emp.id_employee],
      }));
    }}
    disabled={disabledEmployees[emp.id_employee]}
  />
                        </td>
                      <td>
                        <button
                          className="update-button flex items-center justify-center p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                          onClick={() => handleUpdateClick(emp)}
                        >
                          <RefreshCcw className="w-5 h-5" />
                        </button>
                      </td>
                      <td>
                  <button className="delete-button2 flex items-center justify-center p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  onClick={() => handleDeleteEmployee(emp.id_employee)}>

                    <Trash className="w-5 h-5" />
                  </button>
                </td>
                      
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button className="tk-btn"
            onClick={handleConfirmAttendance}>Xác nhận chấm công</button>
            <button
  className="add-employee-button"
  onClick={() => {
    setFormData({
      id_employee: "",
      employee_name: "",
      birthday: "",
      gender: "",
      phone: "",
      office_name: offices.length > 0 ? offices[0].office_name : ""
    });
    setTabType("add");
  }}
>
  Thêm nhân viên
</button>
            {/* Tab cập nhật */}
            {tabType && (
  <div className="tab-content-box">
    <div className="tab-header">
      <span>
        {tabType === "update"
          ? `Cập nhật nhân viên: ${formData.employee_name}`
          : "Thêm nhân viên mới"}
      </span>
      <button
        onClick={() => setTabType(null)}
        className="tab-close"
      >
        ✕
      </button>
    </div>

    <div className="tab-body">
      <div className="form-group">
        <label>ID:</label>
        <input
          type="text"
          value={formData.id_employee}
          onChange={(e) =>
            setFormData({ ...formData, id_employee: e.target.value })
          }
          disabled={tabType === "update"} // ❗ khóa ID nếu đang update
        />
      </div>

      {/* Các input khác giữ nguyên */}
      <div className="form-group">
        <label>Tên:</label>
        <input
          type="text"
          value={formData.employee_name}
          onChange={(e) =>
            setFormData({ ...formData, employee_name: e.target.value })
          }
        />
      </div>
      <div className="form-group">
        <label>Ngày sinh:</label>
        <input
          type="date"
          value={formData.birthday}
          onChange={(e) =>
            setFormData({ ...formData, birthday: e.target.value })
          }
        />
      </div>
      <div className="form-group">
        <label>Giới tính:</label>
        <input
          type="text"
          value={formData.gender}
          onChange={(e) =>
            setFormData({ ...formData, gender: e.target.value })
          }
        />
      </div>
      <div className="form-group">
        <label>SDT:</label>
        <input
          type="text"
          value={formData.phone}
          onChange={(e) =>
            setFormData({ ...formData, phone: e.target.value })
          }
        />
      </div>
      <div className="form-group">
        <label>Công việc:</label>
        <select
          value={formData.office_name}
          onChange={(e) =>
            setFormData({ ...formData, office_name: e.target.value })
          }
        >
          {offices.map((office) => (
            <option key={office.id_office} value={office.office_name}>
              {office.office_name}
            </option>
          ))}
        </select>
      </div>
    </div>

    <div className="tab-footer">
      <button
        className="update-confirm-button"
        onClick={handleSubmitEmployee}
      >
        Xác nhận
      </button>
    </div>
  </div>
)}
          </div>
        </div>
      </div>
  )}
















{activedId === 4 && (
  <div className="managetable">
    <div className="table4">
      {/* Bên trái */}
      <div className="goods-wrapper">
        <table className="goods-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Tên món</th>
              <th>Loại</th>
              <th>Giá</th>
              <th>Số lượng còn</th>
              <th>Ảnh</th>
              <th></th>
              <th></th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {dishList.map((dish) => (
              <tr key={dish.id_dish}>
                <td>{dish.id_dish}</td>
                <td>{dish.dish_name}</td>
                <td>{dish.type_of_dish}</td>
                <td>
  {editingRowId === dish.id_dish ? (
    <input
      type="number"
      value={editValues.dish_cost}
      onChange={(e) =>
        setEditValues({ ...editValues, dish_cost: e.target.value })
      }
    />
  ) : (
    dish.dish_cost.toLocaleString("vi-VN") + "đ"
  )}
</td>

<td>
  {editingRowId === dish.id_dish ? (
    <input
      type="number"
      value={editValues.dish_stock}
      onChange={(e) =>
        setEditValues({ ...editValues, dish_stock: e.target.value })
      }
    />
  ) : (
    dish.dish_stock
  )}
</td>
                <td>
                  <img
                    src={dish.dish_image}
                    alt={dish.dish_name}
                    style={{
                      width: "50px",
                      height: "50px",
                      objectFit: "cover",
                      borderRadius: "6px",
                    }}
                  />
                </td>
                <td>
                <button
  className="update2-button flex items-center justify-center p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
  onClick={() => {
    setEditingRowId(dish.id_dish);
    setEditValues({ dish_cost: dish.dish_cost, dish_stock: dish.dish_stock });
  }}
>
  <RefreshCcw className="w-5 h-5" />
</button>
                </td>
                <td>
                  <button className="delete-button flex items-center justify-center p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  onClick={() => handleDeleteDish(dish.id_dish)}>

                    <Trash className="w-5 h-5" />
                  </button>
                </td>
                <td>
  {editingRowId === dish.id_dish ? (
    <button
      className="save-button p-2 bg-green-500 text-white rounded hover:bg-green-600"
      onClick={() => handleSaveEdit(dish.id_dish)}
    >
      Lưu
    </button>
  ) : null}
</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Bên phải - Cùng cấp với goods-wrapper */}
      <div className="goods-wrapper add-form-wrapper">
    <h3>➕ Thêm món ăn mới</h3>
    <div className="form-row">
    <input
  type="text"
  placeholder="ID món"
  value={newDish.id_dish}
  onChange={(e) => setNewDish({ ...newDish, id_dish: e.target.value })}
/>
<input
  type="text"
  placeholder="Tên món"
  value={newDish.dish_name}
  onChange={(e) => setNewDish({ ...newDish, dish_name: e.target.value })}
/>
<input
  type="text"
  placeholder="Loại"
  value={newDish.type_of_dish}
  onChange={(e) => setNewDish({ ...newDish, type_of_dish: e.target.value })}
/>
<input
  type="number"
  placeholder="Giá"
  value={newDish.dish_cost}
  onChange={(e) => setNewDish({ ...newDish, dish_cost: e.target.value })}
/>
<input
  type="number"
  placeholder="Số lượng còn"
  value={newDish.dish_stock}
  onChange={(e) => setNewDish({ ...newDish, dish_stock: e.target.value })}
/>
<input
  type="text"
  placeholder="URL Ảnh"
  value={newDish.dish_image}
  onChange={(e) => setNewDish({ ...newDish, dish_image: e.target.value })}
/>
      <button className="add-button" onClick={handleAddDish}>Thêm</button>
    </div>
  </div>
    </div>
  </div>

      )}

{activedId === 5 && (
  <div className="table5">
    <div className="salary-container">
      {/* Header */}
      <div className="table5-header">
        <h2 className="salary-title">Bảng lương nhân viên</h2>
        <div className="month-selector">
          <label htmlFor="month">Chọn tháng:</label>
          <input
            type="month"
            id="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
          />
        </div>
      </div>

      {/* Body */}
      <div className="table5-body">
        <table className="salary-table">
          <thead>
            <tr className="bg-gray-100">
              <th>ID</th>
              <th>Tên nhân viên</th>
              <th>Giới tính</th>
              <th>SĐT</th>
              <th>Phòng ban</th>
              <th>Số ngày công</th>
              <th>Lương/ngày</th>
              <th>Thưởng</th>
              <th>Tổng lương</th>
              <th>Trạng thái</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {salaryData.map((row) => (
              <tr key={row.id_employee}>
                <td>{row.id_employee}</td>
                <td>{row.employee_name}</td>
                <td>{row.gender}</td>
                <td>{row.phone}</td>
                <td>{row.office_name}</td>
                <td>{row.days_present}</td>
                <td>{row.daily_wage.toLocaleString()}đ</td>
                <td>{row.bonus.toLocaleString()}đ</td>
                <td className="highlight">
                  {(row.daily_wage * row.days_present + row.bonus).toLocaleString()}đ
                </td>
                <td>
                  {row.status === 1 ? (
                    <span className="text-green-600">Đã thanh toán</span>
                  ) : (
                    <span className="text-red-500">Chưa thanh toán</span>
                  )}
                </td>
                <td>
                <input
        type="checkbox"
        disabled={row.status === 1}
        checked={paidStatus[row.id_employee] || false}
        onChange={(e) =>
          setPaidStatus((prev) => ({
            ...prev,
            [row.id_employee]: e.target.checked,
          }))
        }
      />
                </td>

              </tr>
            ))}
          </tbody>
        </table>
        <div className="mt-4 text-right">
        <button
          onClick={handleSalaryConfirm}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Xác nhận thanh toán
        </button>
      </div>
      </div>
    </div>
  </div>
)}



      </div>
      </div>
  );
    };