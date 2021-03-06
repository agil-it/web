import React, { Component } from 'react';
import '../index.css';
import { HandlerProvider } from '../providers/handler';
import { DashboardProvider } from '../providers/Dashboard';
import { C_Table } from '../components/Table';
import { C_MaintenanceOrder } from '../components/Order';
import { C_Icon } from '../components/Icon';
import { C_ToolTip } from '../components/ToolTip';
import { C_Loading } from '../components/Loading';
import { MaintenanceOrderHelper as HelperOM } from '../helpers/MaintenanceOrder';
import { DateHelper } from '../helpers/Date';

class AdminDashboard extends Component {
  constructor(props) {
    super(props);

    this.state = {
      list: [],
      formattedList: [],
      isLoading: true,
      columns: [
        { name: "Alerta", property: "hasAlerts", isIcon: true },
        { name: "Ordem", property: "orderNumber", defaultValue: "Sem Identificação" },
        { name: "Data de Abertura", property: "openedDate", format: value =>  DateHelper.formatDate(value)},
        { name: "Classificação", property: "classification", defaultValue: "Sem Classificação" },
        { name: "Prioridade", property: "priority", format: value =>  HelperOM.translate('priority', value)},
        { name: "Técnico", isIcon: false, property: "maintainer" },
        { name: "Solicitante", isIcon: false, property: "leader" },
        { name: "Administrador", isIcon: false, property: "administrator" },
        { name: "Exportado", isIcon: false,  property: "exported" },
      ]
    }

    this.calculateHeight = this.calculateHeight.bind(this);
    this.formatList = this.formatList.bind(this);
    this.provider = new HandlerProvider(new DashboardProvider(), "dashboard")
  }

  calculateHeight() {
    const height = document.getElementById('searchTable').clientHeight;
    const rowsPerPage = Math.round(height / 60) - 2;
    return rowsPerPage;
  }

  componentDidMount() {
    this.list();
  }

  async list() {
    let list = this.state.list;

    this.setState({ isLoading: true });

    let response = await this.provider.get("pending-orders");
    if (response.success) list = response.data

    var formattedList = this.formatList(list);
    console.log("AdminDashboard -> list -> formattedList", formattedList)

    this.setState({ list, formattedList, isLoading: false })
  }

  formatList(list) {
    return list.map(order => {
      const tableOrder = {
        id: order.id,
        priority: order.priority,
        openedDate: order.openedDate,
        orderNumber: order.orderNumber,
        leader: "🔴",
        maintainer: "🔴",
        administrator: "🔴",
        exported: order.exported ? "🟢" : "🔴",
        hasAlerts: order.hasAlerts ? 'warning' : 'check',
        classification: order.orderLayout.classification || HelperOM.translate('layout', order.orderLayout.orderLayout),
      }

      order.orderSignature.forEach(sign => {
        if (sign.signatureStatus == "signed") tableOrder[sign.signatureRole] = "🟢"
      });

      return tableOrder;
    })
  }

  render() {
    return (
      <div>
        { this.state.openOrder ?
          <div id="order" style={{ width: "100%" }}>
            <C_MaintenanceOrder
              orderId={this.state.order.id}
              onClose={() => this.setState({ openOrder: false })}
            />
          </div>
          :
          <div>
            {this.state.isLoading ?
            <div style={{ marginTop: "10%", alignItems: "center", display: "flex", justifyContent: "center" }}>
              <C_Loading
                scale={3}
                footer={true}
                message={"Verificando pendências..."}
              />
            </div>
            :
            <div>
              <div style={{ display: "flex", alignItems: "center" }}>
                <h1 style={{ padding: "15px 0px 2px 20px", color: "black" }}>{"Analisar Pendências"}</h1>
                <C_ToolTip position="right" tooltip="Atualizar">
                  <C_Icon style={{ cursor: "pointer", fontSize: 40, marginLeft: 15 }} icon="refresh" action={() => this.list()} />
                </C_ToolTip>
              </div>
              <div id="searchTable" style={{ marginTop: 40, width: "100%", boxShadow: "1px 3px 12px 1px #918f8e" }}>
                <C_Table
                  columns={this.state.columns}
                  content={this.state.formattedList}
                  onClick={(content) => this.setState({ openOrder: true, order: content })}
                  showEffect={true}
                  showPagination={true}
                  hasFilter={true}
                  textAlign="center"
                  rowsPerPage={10}
                  fontSize={18}
                >
                </C_Table>
              </div>
            </div>
            }
          </div>
        }
      </div>
    )
  }
}

export default AdminDashboard;