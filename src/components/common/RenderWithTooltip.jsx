import { Tooltip } from '@mui/material';
import { getLabelFromId } from '../../utils/common';

const cellHasEllipsis = (e, ref) => {
	const cell = ref.current?.querySelector(`[data-id="${e.id}"] [data-field="${e.field}"]`);
	if (cell) {
		return cell.scrollWidth > cell.clientWidth;
	}
	return false;
};

export const RenderWithTooltip = (e, ref) => {
	const { value, field } = e;
	const text = getLabelFromId(value, field);

	if (cellHasEllipsis(e, ref)) {
		return (
			<Tooltip title={text}><span>{text}</span></Tooltip>
		)
	} else {
		return <span>{text}</span>
	}
};
