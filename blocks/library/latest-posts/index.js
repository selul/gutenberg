/**
 * WordPress dependencies
 */
import { Placeholder, FormToggle } from 'components';
import { __ } from 'i18n';

/**
 * Internal dependencies
 */
import './style.scss';
import { registerBlockType } from '../../api';
import { getLatestPosts } from './data.js';
import InspectorControls from '../../inspector-controls';

/**
 * Returns an attribute setter with behavior that if the target value is
 * already the assigned attribute value, it will be set to undefined.
 *
 * @param  {string}   align Alignment value
 * @return {Function}       Attribute setter
 */
function toggleAlignment( align ) {
	return ( attributes, setAttributes ) => {
		const nextAlign = attributes.align === align ? undefined : align;
		setAttributes( { align: nextAlign } );
	};
}

registerBlockType( 'core/latestposts', {
	title: __( 'Latest Posts' ),

	icon: 'list-view',

	category: 'widgets',

	defaultAttributes: {
		poststoshow: 5,
		displayPostDate: false,
	},

	controls: [
		{
			icon: 'align-left',
			title: __( 'Align left' ),
			isActive: ( { align } ) => 'left' === align,
			onClick: toggleAlignment( 'left' ),
		},
		{
			icon: 'align-center',
			title: __( 'Align center' ),
			isActive: ( { align } ) => ! align || 'center' === align,
			onClick: toggleAlignment( 'center' ),
		},
		{
			icon: 'align-right',
			title: __( 'Align right' ),
			isActive: ( { align } ) => 'right' === align,
			onClick: toggleAlignment( 'right' ),
		},
		{
			icon: 'align-wide',
			title: __( 'Wide width' ),
			isActive: ( { align } ) => 'wide' === align,
			onClick: toggleAlignment( 'wide' ),
		},
		{
			icon: 'align-full-width',
			title: __( 'Full width' ),
			isActive: ( { align } ) => 'full' === align,
			onClick: toggleAlignment( 'full' ),
		},
	],

	getEditWrapperProps( attributes ) {
		const { align } = attributes;
		if ( 'left' === align || 'right' === align || 'wide' === align || 'full' === align ) {
			return { 'data-align': align };
		}
	},

	edit: class extends wp.element.Component {
		constructor() {
			super( ...arguments );

			const { poststoshow, displayPostDate } = this.props.attributes;

			this.state = {
				latestPosts: [],
			};

			this.latestPostsRequest = getLatestPosts( poststoshow, displayPostDate );

			this.latestPostsRequest
				.then( latestPosts => this.setState( { latestPosts } ) );

			this.toggleDisplayPostDate = this.toggleDisplayPostDate.bind( this );
		}

		toggleDisplayPostDate() {
			const { displayPostDate } = this.props.attributes;
			const { setAttributes } = this.props;

			setAttributes( { displayPostDate: ! displayPostDate } );
		}

		render() {
			const { latestPosts } = this.state;

			if ( ! latestPosts.length ) {
				return (
					<Placeholder
						icon="update"
						label={ __( 'Loading latest posts, please wait' ) }
					>
					</Placeholder>
				);
			}

			const { focus } = this.props;
			const { displayPostDate } = this.props.attributes;

			const displayPostDateId = 'post-date-toggle';

			return [
				focus && (
					<InspectorControls key="inspector">
						<div className="editor-latest-posts__row">
							<label htmlFor={ displayPostDateId }>{ __( 'Display post date?' ) }</label>
							<FormToggle
								id={ displayPostDateId }
								checked={ displayPostDate }
								onChange={ this.toggleDisplayPostDate }
								showHint={ false }
							/>
						</div>
					</InspectorControls>
				),
				<div className="blocks-latest-posts" key="latest-posts">
					<ul>
						{ latestPosts.map( ( post, i ) =>
							<li key={ i }><a href={ post.link }>{ post.title.rendered }</a></li>
						) }
					</ul>
				</div>,
			];
		}

		componentWillUnmount() {
			if ( this.latestPostsRequest.state() === 'pending' ) {
				this.latestPostsRequest.abort();
			}
		}
	},

	save() {
		return null;
	},
} );
